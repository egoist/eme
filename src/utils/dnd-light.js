const DragAndDrop = Vue => {
  Vue.directive('drag-and-drop', {
    params: [
      'drag-and-drop',
      'drag-start',
      'drag',
      'drag-over',
      'drag-enter',
      'drag-leave',
      'drag-end',
      'drop'
    ],
    bind() {
      this.vm._dragSrcEl = null
      this.handleDragStart = e => {
        e.target.classList.add('dragging')
        this.vm._dragSrcEl = e.target
        e.dataTransfer.effectAllowed = 'move'
        e.dataTransfer.setData('text', '*')
        if (typeof (this.vm[this.params.dragStart]) === 'function') {
          this.vm[this.params.dragStart].call(this, e.target)
        }
      }
      this.handleDragOver = e => {
        if (e.preventDefault) {
          e.preventDefault()
        }
        e.dataTransfer.dropEffect = 'move'
        return false
      }
      this.handleDragEnter = e => {
        if (typeof (this.vm[this.params.dragEnter]) === 'function') {
          this.vm[this.params.dragEnter].call(this, e.target)
        }
        e.target.classList.add('drag-enter')
      }
      this.handleDragLeave = e => {
        if (typeof (this.vm[this.params.dragLeave]) === 'function') {
          this.vm[this.params.dragLeave].call(this, e.target)
        }
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
            const el = (e.target.draggable) ? e.target : e.target.parentElement
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
    unbind() {
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

export default DragAndDrop
