import store from 'src/vuex/store'

const transition = {
  type: 'animation',
  beforeEnter() {
    store.commit('SLIDE_SWITCHING', true)
  },
  afterLeave() {
    store.commit('SLIDE_SWITCHING', false)
  }
}

const types = [
  'bounce',
  'slide',
  'fade',
  'zoom'
]

/**
 * TODO Replace Vue.transition(`${type}-${direction}`) with a component that uses the new <transition> or <transition-group> element as its root
 * @deprecated in Vue2, use transition elements instead: https://vuejs.org/v2/guide/transitions.html#Reusable-Transitions
 */
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
