<template>
  <span class="svg-icon">
    {{{ icon }}}
  </span>
</template>

<script>
  import pencil from 'src/svg/pencil.svg'
  import alignHorizontalMiddle from 'src/svg/align-horizontal-middle.svg'
  import eye from 'src/svg/eye.svg'

  const icons = {
    pencil,
    alignHorizontalMiddle,
    eye
  }

  export default {
    props: {
      name: {
        required: true,
        type: String
      }
    },
    computed: {
      icon() {
        return icons[this.name]
      }
    }
  }
</script>
