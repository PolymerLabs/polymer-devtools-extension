(function () {
  var COLOR_POLYMER_SELECTED = '#cdcdc1';
  var COLOR_POLYMER_UNSELECTED = '#eeeee0';

  function newExpandBtnImg(collapsed) {
    return collapsed ? '../res/expand.png' : '../res/collapse.png';
  }

  Polymer('element-tree', {
    indent: 0,
    collapsed: false,
    // Whether the element at the root is selected or not
    selected: false,
    baseWidth: 10,
    expandBtnImg: 'res/collapse.png',
    // Polymer elements are shown differently and can be selected
    isPolymer: false,
    ready: function () {
      this.childElements = [];
      this.$.childrenContent.style.marginLeft = this.indent + this.baseWidth + 'px';
    },
    addChild: function (element) {
      this.childElements.push(element);
      this.$.childrenContent.appendChild(element);
    },
    /**
    * Empties the element-tree
    */
    empty: function () {
      this.text = '';
      if (this.selected) {
        this.root.selectedChild = null;
        this.selected = false;
      }
      if (this.keyMap && this.keyMap[this.key]) {
        delete this.keyMap[this.key];
      }
      for (var i = 0; i < this.childElements.length; i++) {
        this.childElements[i].empty();
        this.$.childrenContent.innerHTML = '';
      }
      delete this.childElements;
      this.childElements = [];
    },
    /**
    * Pre-populates the element-tree with a given tree
    * @root: not passed in first call, but passed internally to
    * pass around the root of the entire tree.
    */
    initFromDOMTree: function (tree, root, keyMap) {
      this.empty();
      this.text = '<' + tree.tagName + '>';
      this.isPolymer = tree.isPolymer;
      this.key = tree.key;
      this.keyMap = keyMap || this.keyMap || {};
      this.keyMap[this.key] = this;
      if (this.isPolymer) {
        this.$.name.setAttribute('polymer', 'polymer');
      }
      this.root = root || this;
      for (var i = 0; i < tree.children.length; i++) {
        // Create a new ElementTree to hold a child
        var child = new ElementTree();
        child.indent = this.indent + this.baseWidth;
        child.initFromDOMTree(tree.children[i], this.root, this.keyMap);
        this.addChild(child);
      }
    },
    /**
    * Collapse/Uncollapse
    */
    toggle: function () {
      if (this.childElements.length === 0) {
        return;
      }
      this.collapsed = !(this.collapsed);
      this.expandBtnImg = newExpandBtnImg(this.collapsed);
      for (var i = 0; i < this.childElements.length; i++) {
        if (this.collapsed) {
          this.childElements[i].$.content.style.display = 'none';
        } else {
          this.childElements[i].$.content.style.display = 'block';
        }
      }
    },
    /**
    * Element selection/unselection
    */
    toggleSelection: function () {
      if (!this.isPolymer) {
        return;
      }
      if (this.selected) {
        // selectedChild holds the element in the tree that is currently selected
        this.root.selectedChild = null;
        this.$.thisElement.removeAttribute('selected');
        this.selected = !(this.selected);
        this.fire('unselected', {
          key: this.key
        });
      } else {
        var oldKey = null;
        if (this.root.selectedChild) {
          oldKey = this.root.selectedChild.key;
          // First unselect the currently selected child
          this.root.selectedChild.selected = false;
          this.root.selectedChild.$.thisElement.removeAttribute('selected');
        }
        this.root.selectedChild = this;
        this.$.thisElement.setAttribute('selected', 'selected');
        this.selected = !(this.selected);
        this.fire('selected', {
          key: this.key,
          oldKey: oldKey
        });
      }
    },
    /*
    * Gets the child tree for an element's key
    **/
    getChildTreeForKey: function (key) {
      return this.keyMap ? this.keyMap[key] : null;
    },
    /** 
    * Tells the extension to highlight the element that was hovered on. 
    */
    mouseOver: function () {
      if (!this.selected) {
        this.fire('highlight', {
          key: this.key
        });
      }
    },
    mouseOut: function () {
      if (!this.selected) {
        this.fire('unhighlight', {
          key: this.key
        });
      }
    }
  });
})();
