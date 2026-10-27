<script setup lang="ts">
import {
  composeIsoDateTime,
  isoToJalali,
  jalaliMonthLength,
  jalaliToIso,
} from "~/utils/jalali";
import { persianDigits } from "~/utils/persianDate";

const props = withDefaults(
  defineProps<{
    label: string;
    modelValue: string;
    error?: string;
    mode?: "date" | "datetime";
    required?: boolean;
  }>(),
  { mode: "date" },
);

const emit = defineEmits<{
  "update:modelValue": [value: string];
}>();

const copy = await usePanelCopy();
const root = ref<HTMLElement | null>(null);
const open = ref(false);
const id = useId();
const hour = ref(0);
const minute = ref(0);
const viewYear = ref(1404);
const viewMonth = ref(1);

const weekdays = Array.from({ length: 7 }, (_, index) =>
  new Intl.DateTimeFormat("fa-IR", { weekday: "narrow" }).format(
    new Date(Date.UTC(2024, 2, 23 + index, 12)),
  ),
);

const selected = computed(() => isoToJalali(props.modelValue));

const monthTitle = computed(() => {
  const iso = jalaliToIso(viewYear.value, viewMonth.value, 1);
  const name = iso
    ? new Intl.DateTimeFormat("fa-IR", {
        calendar: "persian",
        month: "long",
      }).format(new Date(`${iso}T12:00:00Z`))
    : "";
  return `${name} ${persianDigits(viewYear.value)}`;
});

const leading = computed(() => {
  const iso = jalaliToIso(viewYear.value, viewMonth.value, 1);
  if (!iso) return 0;
  const date = new Date(`${iso}T12:00:00Z`);
  return (date.getUTCDay() + 1) % 7;
});

const days = computed(() =>
  Array.from(
    { length: jalaliMonthLength(viewYear.value, viewMonth.value) },
    (_, index) => index + 1,
  ),
);

const display = computed(() => {
  if (!props.modelValue) return "";
  const date = props.modelValue.slice(0, 10);
  const label = formatPersianDate(date);
  if (props.mode !== "datetime") return label;
  const match = /T(\d{2}):(\d{2})/.exec(props.modelValue);
  if (!match) return label;
  return `${label} ${persianDigits(match[1] ?? "00")}:${persianDigits(match[2] ?? "00")}`;
});

function syncView() {
  const current = selected.value;
  if (current) {
    viewYear.value = current.year;
    viewMonth.value = current.month;
  }
  const match = /T(\d{2}):(\d{2})/.exec(props.modelValue);
  hour.value = match ? Number(match[1]) : 0;
  minute.value = match ? Number(match[2]) : 0;
}

function shift(step: number) {
  let month = viewMonth.value + step;
  let year = viewYear.value;
  if (month < 1) {
    month = 12;
    year -= 1;
  } else if (month > 12) {
    month = 1;
    year += 1;
  }
  viewMonth.value = month;
  viewYear.value = year;
}

function emitValue(day: number) {
  const iso = jalaliToIso(viewYear.value, viewMonth.value, day);
  if (!iso) return;
  emit(
    "update:modelValue",
    props.mode === "datetime" ? composeIsoDateTime(iso, hour.value, minute.value) : iso,
  );
  if (props.mode === "date") open.value = false;
}

function emitTime() {
  const current = selected.value;
  const iso = current
    ? jalaliToIso(current.year, current.month, current.day)
    : jalaliToIso(viewYear.value, viewMonth.value, 1);
  if (!iso) return;
  emit("update:modelValue", composeIsoDateTime(iso, hour.value, minute.value));
}

function onPointer(event: PointerEvent) {
  if (!root.value?.contains(event.target as Node)) open.value = false;
}

function toggle() {
  syncView();
  open.value = !open.value;
}

onMounted(() => document.addEventListener("pointerdown", onPointer));
onBeforeUnmount(() => document.removeEventListener("pointerdown", onPointer));
</script>

<template>
  <div ref="root" class="grid gap-1">
    <label :id="`${id}-label`" class="text-sm text-secondary">
      {{ label }}
      <span v-if="required" class="rwmb-required">*</span>
    </label>
    <button
      type="button"
      class="border-b border-line bg-transparent py-2 text-start focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-primary"
      :aria-labelledby="`${id}-label`"
      :aria-expanded="open"
      :aria-invalid="error ? 'true' : undefined"
      :aria-describedby="error ? `${id}-help` : undefined"
      @click="toggle"
    >
      {{ display }}
    </button>
    <div v-if="open" class="grid gap-3 border border-line bg-paper p-3">
      <div class="flex items-center justify-between gap-3">
        <button type="button" class="button" @click="shift(-1)">
          {{ copy.fields.previousMonth }}
        </button>
        <p>{{ monthTitle }}</p>
        <button type="button" class="button" @click="shift(1)">
          {{ copy.fields.nextMonth }}
        </button>
      </div>
      <div class="grid grid-cols-7 gap-1 text-center">
        <span v-for="name in weekdays" :key="name" class="text-sm text-secondary">{{
          name
        }}</span>
        <span v-for="blank in leading" :key="`blank-${blank}`" />
        <button
          v-for="day in days"
          :key="day"
          type="button"
          class="py-1"
          :class="
            selected &&
            selected.year === viewYear &&
            selected.month === viewMonth &&
            selected.day === day
              ? 'bg-primary text-paper'
              : ''
          "
          @click="emitValue(day)"
        >
          {{ persianDigits(day) }}
        </button>
      </div>
      <div v-if="mode === 'datetime'" class="grid gap-3 sm:grid-cols-2">
        <label class="grid gap-1 text-sm text-secondary">
          {{ copy.fields.hour }}
          <select
            v-model.number="hour"
            class="border border-line bg-paper p-2 text-ink"
            @change="emitTime"
          >
            <option v-for="value in 24" :key="value" :value="value - 1">
              {{ persianDigits(String(value - 1).padStart(2, "0")) }}
            </option>
          </select>
        </label>
        <label class="grid gap-1 text-sm text-secondary">
          {{ copy.fields.minute }}
          <select
            v-model.number="minute"
            class="border border-line bg-paper p-2 text-ink"
            @change="emitTime"
          >
            <option v-for="value in 60" :key="value" :value="value - 1">
              {{ persianDigits(String(value - 1).padStart(2, "0")) }}
            </option>
          </select>
        </label>
      </div>
    </div>
    <p v-if="error" :id="`${id}-help`" class="text-sm text-accent" role="alert">
      {{ error }}
    </p>
  </div>
</template>
