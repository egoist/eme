const DragAndDrop = {}

const params = [
  'drag-and-drop',
  'drag-start',
  'drag',
  'drag-over',
  'drag-enter',
  'drag-leave',
  'drag-end',
  'drop'
]

DragAndDrop.install = Vue => {
  Vue.directive('drag-and-drop', {
    params: [...params],
    bind: function () {
      this.vm._dragSrcEl = null
      this.handleDragStart = e => {
        e.target.classList.add('dragging')
        this.vm._dragSrcEl = e.target
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text', '*')
      }
      this.handleDragOver = e => {
        if (e.preventDefault) {
          e.preventDefault()
        }
        e.dataTransfer.dropEffect = 'move'
        e.target.classList.add('drag-over')
        return false
      }
      this.handleDragEnter = e => {
        e.target.classList.add('drag-enter')
      }
      this.handleDragLeave = e => {
        e.target.classList.remove('drag-enter')
      }
      this.handleDragEnd = e => {
        e.target.classList.remove('dragging', 'drag-over', 'drag-enter')
      }
      this.handleDrop = e => {
        if (e.stopPropagation) {
          e.stopPropagation()
        }

        if (this.vm._dragSrcEl !== e.target) {
          if (typeof (this.vm[this.params.drop]) === 'function') {
            var el = (e.target.draggable) ? e.target : e.target.parentElement
            this.vm[this.params.drop].call(this, this.vm._dragSrcEl, el)
          }
        }
        return false
      }

      this.el.setAttribute('draggable', 'true')
      this.el.addEventListener('dragstart', this.handleDragStart, false)
      this.el.addEventListener('dragenter', this.handleDragEnter, false)
      this.el.addEventListener('dragover', this.handleDragOver, false)
      this.el.addEventListener('drag', this.handleDrag, false)
      this.el.addEventListener('dragleave', this.handleDragLeave, false)
      this.el.addEventListener('drop', this.handleDrop, false)
      this.el.addEventListener('dragend', this.handleDragEnd, false)
    },
    update: function (newValue, oldValue) {
      // console.log(this);
    },
    unbind: function () {
      this.el.classList.remove('dragging', 'drag-over', 'drag-enter')
      this.el.removeAttribute('draggable')
      this.el.removeEventListener('dragstart', this.handleDragStart)
      this.el.removeEventListener('dragenter', this.handleDragEnter)
      this.el.removeEventListener('dragover', this.handleDragOver)
      this.el.removeEventListener('dragleave', this.handleDragLeave)
      this.el.removeEventListener('drag', this.handleDrag)
    }
  })
}

module.exports = DragAndDrop