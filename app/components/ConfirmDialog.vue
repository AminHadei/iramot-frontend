<script setup lang="ts">
const dialog = ref<HTMLDialogElement | null>(null);
const titleId = useId();
const { state, finish } = useConfirmDialog();

watch(
  () => state.value.open,
  async (open) => {
    await nextTick();
    const node = dialog.value;
    if (!node) return;
    if (open && !node.open) node.showModal();
    if (!open && node.open) node.close();
  },
);

function onCancel(event: Event) {
  event.preventDefault();
  finish(false);
}

function onBackdrop(event: MouseEvent) {
  if (event.target === dialog.value) finish(false);
}
</script>

<template>
  <dialog
    ref="dialog"
    class="confirm-dialog"
    aria-modal="true"
    :aria-labelledby="titleId"
    @cancel="onCancel"
    @click="onBackdrop"
  >
    <h2 :id="titleId" class="font-heading text-2xl text-primary">{{ state.title }}</h2>
    <p class="mt-3">{{ state.message }}</p>
    <div class="mt-6 flex flex-wrap gap-3">
      <button type="button" class="button" @click="finish(false)">
        {{ state.cancelLabel }}
      </button>
      <button
        type="button"
        class="button bg-primary px-4 py-2 text-paper"
        @click="finish(true)"
      >
        {{ state.confirmLabel }}
      </button>
    </div>
  </dialog>
</template>
