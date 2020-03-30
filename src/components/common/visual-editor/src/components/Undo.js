export default class Undo {
  constructor() {
    this.stack = [];
    this.pointer = 0;
    this.canUndo = false;
    this.canRedo = false;
    return this;
  }

  setState() {
    if (this.stack[this.stack.length - 1 + this.pointer]) {
      this.canUndo = true;
    }
    if (this.stack[this.stack.length + this.pointer]) {
      this.canRedo = true;
    }
  }

  add(doAction, undoAction) {
    // 传进来的数据需要clone一下
    if (this.pointer < 0) {
      this.stack.splice(this.pointer);
      this.pointer = 0;
    }
    this.stack.push({
      doAction,
      undoAction,
    });
    this.setState();
  }

  do(action) {
    action.fn(action.data);
  }

  undo() {
    if (this.stack[this.stack.length - 1 + this.pointer]) {
      this.do(this.stack[this.stack.length - 1 + this.pointer].undoAction);
      this.pointer = this.pointer - 1;
    }
    this.setState();
  }

  redo() {
    if (this.stack[this.stack.length + this.pointer]) {
      this.do(this.stack[this.stack.length + this.pointer].doAction);
      this.pointer = this.pointer + 1;
    }
    this.setState();
  }
}
