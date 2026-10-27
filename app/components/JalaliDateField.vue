<script setup lang="ts">
import {
  composeIsoDateTime,
  formatJalaliField,
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
const triggerEl = ref<HTMLButtonElement | null>(null);
const popEl = ref<HTMLElement | null>(null);
const open = ref(false);
const sheet = ref(false);
const popStyle = ref<Record<string, string>>({});
const id = useId();
const hour = ref(0);
const minute = ref(0);
const viewYear = ref(1404);
const viewMonth = ref(1);
const cursor = ref({ year: 1404, month: 1, day: 1 });
const years = Array.from({ length: 151 }, (_, index) => 1300 + index);
let armed = false;
let restoring = false;

const weekdays = Array.from({ length: 7 }, (_, index) =>
  new Intl.DateTimeFormat("fa-IR", { weekday: "narrow" }).format(
    new Date(Date.UTC(2024, 2, 23 + index, 12)),
  ),
);

const selected = computed(() => isoToJalali(props.modelValue));
const display = computed(() => formatJalaliField(props.modelValue, props.mode));

const today = computed(() => {
  const now = new Date();
  const iso = [
    String(now.getFullYear()),
    String(now.getMonth() + 1).padStart(2, "0"),
    String(now.getDate()).padStart(2, "0"),
  ].join("-");
  return isoToJalali(iso);
});

const months = computed(() =>
  Array.from({ length: 12 }, (_, index) => {
    const month = index + 1;
    const iso = jalaliToIso(viewYear.value, month, 1);
    const name = iso
      ? new Intl.DateTimeFormat("fa-IR", {
          calendar: "persian",
          month: "long",
        }).format(new Date(`${iso}T12:00:00Z`))
      : persianDigits(month);
    return { month, name };
  }),
);

const monthTitle = computed(
  () => months.value.find((item) => item.month === viewMonth.value)?.name ?? "",
);

const weeks = computed(() => {
  const iso = jalaliToIso(viewYear.value, viewMonth.value, 1);
  const leading = iso ? (new Date(`${iso}T12:00:00Z`).getUTCDay() + 1) % 7 : 0;
  const cells: Array<number | null> = Array.from({ length: leading }, () => null);
  const length = jalaliMonthLength(viewYear.value, viewMonth.value);
  for (let day = 1; day <= length; day += 1) cells.push(day);
  while (cells.length % 7 !== 0) cells.push(null);
  const rows: Array<Array<number | null>> = [];
  for (let index = 0; index < cells.length; index += 7) {
    rows.push(cells.slice(index, index + 7));
  }
  return rows;
});

function isSelected(day: number) {
  const current = selected.value;
  return (
    current?.year === viewYear.value &&
    current.month === viewMonth.value &&
    current.day === day
  );
}

function isToday(day: number) {
  const current = today.value;
  return (
    current?.year === viewYear.value &&
    current.month === viewMonth.value &&
    current.day === day
  );
}

function isCursor(day: number) {
  return (
    cursor.value.year === viewYear.value &&
    cursor.value.month === viewMonth.value &&
    cursor.value.day === day
  );
}

function dayLabel(day: number) {
  const label = persianDigits(day);
  return isToday(day) ? `${label} ${copy.fields.today}` : label;
}

function syncView() {
  const current = selected.value ?? today.value ?? { year: 1404, month: 1, day: 1 };
  cursor.value = { ...current };
  viewYear.value = current.year;
  viewMonth.value = current.month;
  const match = /T(\d{2}):(\d{2})/.exec(props.modelValue);
  hour.value = match ? Number(match[1]) : 0;
  minute.value = match ? Number(match[2]) : 0;
}

function place() {
  const trigger = triggerEl.value;
  const pop = popEl.value;
  if (!trigger || !pop || typeof window === "undefined") return;
  if (window.innerWidth <= 640) {
    sheet.value = true;
    popStyle.value = {};
    return;
  }
  sheet.value = false;
  const rect = trigger.getBoundingClientRect();
  const width = Math.min(300, window.innerWidth - 16);
  const height = pop.offsetHeight || 320;
  const spaceBelow = window.innerHeight - rect.bottom;
  const spaceAbove = rect.top;
  const above = spaceBelow < height + 8 && spaceAbove > spaceBelow;
  const maxStart = Math.max(8, window.innerWidth - width - 8);
  const aligned = window.innerWidth - rect.right;
  const start = Math.min(Math.max(8, aligned), maxStart);
  const block = above
    ? Math.max(8, rect.top - height - 6)
    : Math.min(rect.bottom + 6, Math.max(8, window.innerHeight - height - 8));
  popStyle.value = {
    position: "fixed",
    insetInlineStart: `${start}px`,
    top: `${block}px`,
    width: `${width}px`,
  };
}

async function focusCursor() {
  await nextTick();
  place();
  popEl.value
    ?.querySelector<HTMLButtonElement>(`[data-day="${cursor.value.day}"]`)
    ?.focus();
}

async function openCalendar() {
  if (open.value) return;
  syncView();
  open.value = true;
  await nextTick();
  place();
  await focusCursor();
}

function close(restore: boolean) {
  if (!open.value) return;
  open.value = false;
  sheet.value = false;
  if (restore) {
    restoring = true;
    triggerEl.value?.focus();
    restoring = false;
  }
}

function onPointerDown(event: PointerEvent) {
  const target = event.target as Node;
  if (triggerEl.value?.contains(target)) armed = open.value;
  if (!open.value) return;
  if (root.value?.contains(target) || popEl.value?.contains(target)) return;
  close(false);
}

function onTriggerClick() {
  if (armed) close(false);
  else void openCalendar();
}

function onTriggerFocus() {
  if (restoring || open.value) return;
  void openCalendar();
}

function onReflow() {
  if (open.value) place();
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
  const length = jalaliMonthLength(year, month) || 1;
  const day = Math.min(cursor.value.day, length);
  viewYear.value = year;
  viewMonth.value = month;
  cursor.value = { year, month, day };
  void focusCursor();
}

function onViewInput() {
  const length = jalaliMonthLength(viewYear.value, viewMonth.value) || 1;
  cursor.value = {
    year: viewYear.value,
    month: viewMonth.value,
    day: Math.min(cursor.value.day, length),
  };
  void nextTick(place);
}

function emitValue(day: number) {
  const iso = jalaliToIso(viewYear.value, viewMonth.value, day);
  if (!iso) return;
  emit(
    "update:modelValue",
    props.mode === "datetime" ? composeIsoDateTime(iso, hour.value, minute.value) : iso,
  );
  close(true);
}

function emitTime() {
  const current = selected.value;
  if (!current) return;
  const iso = jalaliToIso(current.year, current.month, current.day);
  if (!iso) return;
  emit("update:modelValue", composeIsoDateTime(iso, hour.value, minute.value));
}

function clearValue() {
  emit("update:modelValue", "");
  close(true);
}

function weekdayIndex() {
  const iso = jalaliToIso(cursor.value.year, cursor.value.month, cursor.value.day);
  if (!iso) return 0;
  return (new Date(`${iso}T12:00:00Z`).getUTCDay() + 1) % 7;
}

function moveDays(amount: number) {
  const iso = jalaliToIso(cursor.value.year, cursor.value.month, cursor.value.day);
  if (!iso) return;
  const date = new Date(`${iso}T12:00:00Z`);
  date.setUTCDate(date.getUTCDate() + amount);
  const next = isoToJalali(date.toISOString().slice(0, 10));
  if (!next) return;
  cursor.value = next;
  viewYear.value = next.year;
  viewMonth.value = next.month;
  void focusCursor();
}

function onDayKey(event: KeyboardEvent) {
  if (event.key === "ArrowLeft") moveDays(1);
  else if (event.key === "ArrowRight") moveDays(-1);
  else if (event.key === "ArrowDown") moveDays(7);
  else if (event.key === "ArrowUp") moveDays(-7);
  else if (event.key === "Home") moveDays(-weekdayIndex());
  else if (event.key === "End") moveDays(6 - weekdayIndex());
  else if (event.key === "PageUp") shift(-1);
  else if (event.key === "PageDown") shift(1);
  else if (event.key === "Enter" || event.key === " ") emitValue(cursor.value.day);
  else return;
  event.preventDefault();
}

function onDialogKey(event: KeyboardEvent) {
  if (event.key === "Escape") {
    event.preventDefault();
    close(true);
    return;
  }
  if (event.key !== "Tab" || !popEl.value) return;
  const items = [...popEl.value.querySelectorAll<HTMLElement>("button, select")].filter(
    (node) => !node.hasAttribute("disabled") && node.tabIndex >= 0,
  );
  const first = items[0];
  const last = items.at(-1);
  if (!first || !last) return;
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}

onMounted(() => {
  document.addEventListener("pointerdown", onPointerDown);
  window.addEventListener("resize", onReflow);
  window.addEventListener("scroll", onReflow, true);
});

onBeforeUnmount(() => {
  document.removeEventListener("pointerdown", onPointerDown);
  window.removeEventListener("resize", onReflow);
  window.removeEventListener("scroll", onReflow, true);
});
</script>

<template>
  <div ref="root" class="jalali-field">
    <label :id="`${id}-label`" class="text-sm text-secondary" :for="`${id}-trigger`">
      {{ label }}
      <span v-if="required" class="rwmb-required">*</span>
    </label>
    <div class="jalali-field__line">
      <button
        :id="`${id}-trigger`"
        ref="triggerEl"
        type="button"
        class="jalali-field__trigger"
        :aria-labelledby="`${id}-label`"
        aria-haspopup="dialog"
        :aria-expanded="open"
        :aria-controls="open ? `${id}-dialog` : undefined"
        :aria-invalid="error ? 'true' : undefined"
        :aria-describedby="error ? `${id}-help` : undefined"
        @pointerdown="armed = open"
        @click="onTriggerClick"
        @focus="onTriggerFocus"
      >
        <span dir="ltr" class="jalali-field__value">{{ display }}</span>
        <svg class="jalali-field__icon" viewBox="0 0 16 16" aria-hidden="true">
          <rect
            x="2"
            y="3"
            width="12"
            height="11"
            rx="1"
            fill="none"
            stroke="currentColor"
            stroke-width="1.25"
          />
          <path
            d="M2 6.5h12M5.5 1.5v3M10.5 1.5v3"
            fill="none"
            stroke="currentColor"
            stroke-width="1.25"
          />
        </svg>
      </button>
      <button
        v-if="!required && modelValue"
        type="button"
        class="jalali-field__clear"
        @click="clearValue"
      >
        {{ copy.fields.clearDate }}
      </button>
    </div>
    <p v-if="error" :id="`${id}-help`" class="text-sm text-accent" role="alert">
      {{ error }}
    </p>
    <Teleport to="body">
      <div v-if="open && sheet" class="jalali-backdrop" @pointerdown="close(true)" />
      <div
        v-if="open"
        :id="`${id}-dialog`"
        ref="popEl"
        class="jalali-popover"
        :class="{ 'jalali-popover--sheet': sheet }"
        role="dialog"
        aria-modal="true"
        :aria-label="`${label} ${copy.fields.calendar}`"
        :style="popStyle"
        @keydown="onDialogKey"
      >
        <div class="jalali-popover__nav">
          <button
            type="button"
            class="jalali-icon-button"
            :aria-label="copy.fields.previousMonth"
            @click="shift(-1)"
          >
            <svg class="rtl:-scale-x-100" viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M10 3 5 8l5 5"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              />
            </svg>
          </button>
          <label class="jalali-sr" :for="`${id}-month`">{{ copy.fields.month }}</label>
          <select
            :id="`${id}-month`"
            v-model.number="viewMonth"
            class="jalali-select"
            @change="onViewInput"
          >
            <option v-for="item in months" :key="item.month" :value="item.month">
              {{ item.name }}
            </option>
          </select>
          <label class="jalali-sr" :for="`${id}-year`">{{ copy.fields.year }}</label>
          <select
            :id="`${id}-year`"
            v-model.number="viewYear"
            class="jalali-select"
            @change="onViewInput"
          >
            <option v-for="year in years" :key="year" :value="year">
              {{ persianDigits(year) }}
            </option>
          </select>
          <button
            type="button"
            class="jalali-icon-button"
            :aria-label="copy.fields.nextMonth"
            @click="shift(1)"
          >
            <svg class="rtl:-scale-x-100" viewBox="0 0 16 16" aria-hidden="true">
              <path
                d="M6 3l5 5-5 5"
                fill="none"
                stroke="currentColor"
                stroke-width="1.5"
              />
            </svg>
          </button>
        </div>
        <p class="jalali-sr">{{ monthTitle }} {{ persianDigits(viewYear) }}</p>
        <div v-if="mode === 'datetime'" class="jalali-time">
          <label class="jalali-time__field" :for="`${id}-hour`">
            {{ copy.fields.hour }}
            <select
              :id="`${id}-hour`"
              v-model.number="hour"
              class="jalali-select"
              @change="emitTime"
            >
              <option v-for="value in 24" :key="value" :value="value - 1">
                {{ persianDigits(String(value - 1).padStart(2, "0")) }}
              </option>
            </select>
          </label>
          <label class="jalali-time__field" :for="`${id}-minute`">
            {{ copy.fields.minute }}
            <select
              :id="`${id}-minute`"
              v-model.number="minute"
              class="jalali-select"
              @change="emitTime"
            >
              <option v-for="value in 60" :key="value" :value="value - 1">
                {{ persianDigits(String(value - 1).padStart(2, "0")) }}
              </option>
            </select>
          </label>
        </div>
        <div role="grid" class="jalali-grid" :aria-label="monthTitle">
          <div role="row" class="jalali-grid__row">
            <span
              v-for="name in weekdays"
              :key="name"
              role="columnheader"
              class="jalali-grid__head"
              >{{ name }}</span
            >
          </div>
          <div
            v-for="(week, weekIndex) in weeks"
            :key="weekIndex"
            role="row"
            class="jalali-grid__row"
          >
            <span v-for="(day, dayIndex) in week" :key="`${weekIndex}-${dayIndex}`">
              <button
                v-if="day"
                type="button"
                class="jalali-day"
                role="gridcell"
                :data-day="day"
                :tabindex="isCursor(day) ? 0 : -1"
                :aria-selected="isSelected(day)"
                :aria-current="isToday(day) ? 'date' : undefined"
                :aria-label="dayLabel(day)"
                @keydown="onDayKey"
                @click="emitValue(day)"
              >
                {{ persianDigits(day) }}
              </button>
            </span>
          </div>
        </div>
      </div>
    </Teleport>
  </div>
</template>
