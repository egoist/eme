<style>
  .tip {
    height: 100%;
    display: flex;
    justify-content: center;
    font-size: 2.4em;
    color: #989898;
    padding: 20px;
    text-align: center;
    kbd {
      font-size: 1.6rem;
      border: 1px solid #989898;
      padding: 0px 8px;
      border-radius: 6px;
      margin: 0 5px;
      display: inline-block;
      height: 34px;
      line-height: 34px;
      align-self: center;
      position: relative;
      top: -4px;
    }
    .tip-content {
      align-self: center;
    }
  }
</style>

<template>
  <div class="tip">
    <div class="tip-content" v-html="tip"></div>
  </div>
</template>

<script>
  import random from 'unique-random-array'
  import tips from 'utils/tips'

  const randomTip = random(tips)

  export default {
    data() {
      return {
        tip: randomTip()
      }
    },
    mounted() {
      this.interval = setInterval(() => {
        this.tip = randomTip()
      }, 20000)
    },
    beforeDestroy() {
      clearInterval(this.interval)
      this.interval = null
    }
  }
</script>
