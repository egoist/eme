import store from 'src/vuex/store'

const transition = {
  type: 'animation',
  beforeEnter() {
    store.dispatch('SLIDE_SWITCHING', true)
  },
  afterLeave() {
    store.dispatch('SLIDE_SWITCHING', false)
  }
}

const types = [
  'bounce',
  'slide',
  'fade',
  'zoom'
]

export default Vue => {

  const makeTransition = (type, direction) => {
    const directions = direction === 'left' ?
      ['Right', 'Left'] :
      ['Left', 'Right']

    Vue.transition(`${type}-${direction}`, {
      ...transition,
      enterClass: `${type}In${directions[0]}`,
      leaveClass: `${type}Out${directions[1]}`
    })
  }


  for (const type of types) {
    makeTransition(type, 'left')
    makeTransition(type, 'right')
  }
}
