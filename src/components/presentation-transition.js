import store from 'src/vuex/store'

const makeTransition = (animation, direction) => {
  const directions = direction === 'left' ?
    ['Right', 'Left'] :
    ['Left', 'Right']

  return {
    enterActiveClass: `${animation}In${directions[0]}`,
    leaveActiveClass: `${animation}Out${directions[1]}`
  }
}

export default {
  functional: true,
  props: ['animation', 'direction'],
  render(h, context) {
    const {
      direction,
      animation
    } = context.props
    const t = makeTransition(animation, direction)
    var data = {
      props: {
        name,
        ...t,
        mode: 'out-in'
      },
      on: {
        beforeEnter() {
          store.dispatch('SLIDE_SWITCHING', true)
        },
        afterLeave() {
          store.dispatch('SLIDE_SWITCHING', false)
        }
      }
    }
    return h('transition', data, context.children)
  }
}
