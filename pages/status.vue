<template>
  <div>
    <h1 class="text-2xl font-semibold">当前账号(<span
        class="text-sky-500 font-serif">{{ loginAccount.nick_name }}</span>)的接口调用情况:</h1>
    <div class="container mx-auto">
      <Line :data="chartData" :options="chartOptions" role="img" aria-label="接口调用图表"/>
    </div>
  </div>
</template>

<script setup lang="ts">
import {type APICall, type ApiName, queryAPICall} from "~/store/api";
import {
  CategoryScale,
  Chart as ChartJS,
  type ChartData,
  type ChartOptions,
  Colors,
  Legend,
  LinearScale,
  LineElement,
  PointElement,
  TimeScale,
  Title,
    type TooltipItem,
    Filler,
  Tooltip
} from 'chart.js'
import {Line} from 'vue-chartjs'
import 'chartjs-adapter-dayjs-4/dist/chartjs-adapter-dayjs-4.esm';
import {getArticleList} from '~/utils'
import dayjs from "dayjs";


ChartJS.register(CategoryScale, LinearScale, Title, Tooltip, Legend, PointElement, LineElement, TimeScale, Filler)


interface APICallWithValue extends APICall {
  amount: number
  count: number
}


definePageMeta({
  layout: false
})

useHead({
  title: '接口调用统计'
})


const activeAccount = useActiveAccount()
const loginAccount = useLoginAccount()


const _data = ref<APICallWithValue[]>([])

const chartData = computed<ChartData<'line', APICallWithValue[]>>(() => {
  return {
    // labels: _data.value.map(record => record.call_time),
    datasets: [
      {
        label: '文章列表接口',
        // data: _data.value.map(record => record.total),
        data: _data.value,
        backgroundColor: 'rgb(14 165 233)',
        parsing: {
          xAxisKey: 'call_time',
          yAxisKey: 'amount',
        },
      },
    ],
  }
})

const chartOptions: ChartOptions<'line'> = {
  responsive: true,
  plugins: {
    tooltip: {
      callbacks: {
        footer(tooltipItems: TooltipItem<'line'>[]): string | string[] | void {
          const raw: APICallWithValue = tooltipItems[0].raw as APICallWithValue
          return `调用次数: ${raw.count}`
        }
      }
    }
  },
  interaction: {
    intersect: false,
    mode: 'nearest',
  },
  scales: {
    x: {
      type: 'time',
      ticks: {
        align: 'center',
        maxRotation: 0,
      },
      time: {
        tooltipFormat: 'YYYY-MM-DD HH:mm:ss',
        unit: 'minute'
      },
      grid: {
        tickColor: 'red'
      },
    },
    y: {
      type: 'linear',
      beginAtZero: true,
      min: 0,
      title: {
        text: '数据量',
        display: true,
      },
      grace: '10%'
    },
  },
}

/**
 * 启动 api 调用任务
 */
async function callApi() {
  try {
    await getArticleList(activeAccount.value?.fakeid!, loginAccount.value.token, 0)
    // 正常的话，1分钟后继续调用
    setTimeout(callApi, 60 * 1000)
  } catch (e: any) {
    if (e.message === '200013:freq control') {
      // 接口被限制时，5分钟后继续调用
      setTimeout(callApi, 5 * 60 * 1000)
    } else {
      console.error(e)
    }
  }
}

/**
 * 获取指定接口的调用数据
 * @param name
 */
async function getApiCallData(name: ApiName) {
  const start = dayjs(new Date()).subtract(30, 'minute').toDate().getTime()
  const records = await queryAPICall(loginAccount.value.nick_name!, start)
  const dataset = records.filter(record => record.name === name && !record.payload.keyword)

  const data: APICallWithValue[] = []
  let amount = 0
  let count = 0
  for (const record of dataset) {
    if (record.is_normal) {
      amount += record.payload.size
      count += 1
    } else {
      amount = 0
      count = 0
    }
    data.push({
      ...record,
      amount: amount,
      count: count,
    })
  }
  return data
}

/**
 * 更新图表数据
 */
async function updateChart() {
  try {
    _data.value = await getApiCallData('appmsgpublish')
  } catch (e: any) {
    console.info('查询 api 缓存失败')
    console.error(e)
  }
}


onMounted(async () => {
  // 实时刷新图表显示
  setInterval(async () => {
    await updateChart()
  }, 500)

  await callApi()
})
</script>
