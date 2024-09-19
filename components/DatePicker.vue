<script setup lang="ts">
import { DatePicker as VCalendarDatePicker } from 'v-calendar'
import type { DatePickerRangeObject } from 'v-calendar/dist/types/src/use/datePicker'
import 'v-calendar/style.css'


const props = defineProps({
  modelValue: {
    type: Object as PropType<DatePickerRangeObject>,
    default: {
      start: new Date(),
      end: new Date(),
    }
  }
})

const emit = defineEmits(['update:model-value', 'close'])

const date = computed({
  get: () => props.modelValue,
  set: (value) => {
    emit('update:model-value', value)
    emit('close')
  }
})

const attrs = {
  transparent: true,
  borderless: true,
  color: 'blue',
  'is-dark': { selector: 'html', darkClass: 'dark' },
  'first-day-of-week': 1,
  locale: 'zh-CN'
}
</script>

<template>
  <VCalendarDatePicker v-model.range="date" :columns="2" v-bind="{ ...attrs, ...$attrs }" />
</template>
