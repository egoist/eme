<template>
  <span 
    class="svg-icon"
    v-html="icon">
  </span>
</template>

<script lang="ts">
  import Vue from "vue";

  import pencil from 'src/svg/pencil.svg';
  import alignHorizontalMiddle from 'src/svg/align-horizontal-middle.svg';
  import eye from 'src/svg/eye.svg';
  import arrowLeft from 'src/svg/arrow-left.svg';
  import arrowRight from 'src/svg/arrow-right.svg';
  import settings from 'src/svg/settings.svg';

  interface IconArray {
    [key: string]: string;
  }

  const icons: IconArray = {
    pencil,
    alignHorizontalMiddle,
    eye,
    arrowRight,
    arrowLeft,
    settings,
  }

  export default Vue.extend ({
    props: {
      name: {
        type: String,
        required: true
      }
    },
    computed: {
      icon(): string {
        return icons[this.name];
      }
    }
  });
</script>
