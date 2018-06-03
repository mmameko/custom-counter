const CounterElement = (function() {
	const increaseBtnText = '+';
	const decreaseBtnText = '-';
	const inputCls = 'counter-field';
	const counterBtnCls = 'counter-btn';
	const increaseBtnCls = 'increase-btn';
	const decreaseBtnCls = 'decrease-btn';
	const INPUTS = {
		min: Number.MIN_SAFE_INTEGER,
		max: Number.MAX_SAFE_INTEGER,
		value: 0
	};
	
	class CounterElement extends HTMLElement {
		static get observedAttributes() { return Object.keys(INPUTS); };
		
		constructor() {
			super();
			
			this.isInitialized = false;
		}
		
		connectedCallback() {
			this.shadow = this.attachShadow({ mode: 'open' });
			
			createStyle.call(this);
			createDecreaseBtnElement.call(this);
			createIncreaseBtnElement.call(this);
			createTextElement.call(this);
			
			this.shadow.insertBefore(this.text, this.increaseBtn);
		}
		
		attributeChangedCallback(name, oldValue, newValue) {
			if (!this.isInitialized) {
				// First call, component initialization
				const inputKeys = Object.keys(INPUTS);
				
				inputKeys.forEach((inputKey) => {
					this[inputKey] = this.hasAttribute(inputKey) ? parseInt(this.getAttribute(inputKey)) : INPUTS[inputKey];
				});
				
				this.isInitialized = true;
			} else {
				newValue = parseInt(newValue);
				
				if (name === 'value') {
					if (newValue >= this.min && newValue <= this.max) {
						this.text.textContent = newValue;
						this.value = newValue;
					}
				} else {
					this[name] = newValue;
				}
				
				disableButtons.call(this, this.value);
			}
		}
		
		disconnectedCallback() {
			this.decreaseBtn.removeEventListener('click', this.decreaseLn);
			this.increaseBtn.removeEventListener('click', this.increaseLn);
		};
	}
	
	function createTextElement() {
		let value = this.value;
		
		this.text = document.createElement('span');
		this.text.classList.add(inputCls);
		
		if (value < this.min) {
			this.value = value = this.min;
		}
		
		if (value > this.max) {
			this.value = value = this.max;
		}
		
		disableButtons.call(this, value);
		
		this.text.innerText = value.toString();
	}
	
	function createDecreaseBtnElement() {
		this.decreaseBtn = document.createElement('button');
		this.decreaseLn = () => {
			decrease.call(this);
		};
		
		this.decreaseBtn.innerText = decreaseBtnText;
		this.decreaseBtn.classList.add(counterBtnCls);
		this.decreaseBtn.classList.add(decreaseBtnCls);
		this.decreaseBtn.addEventListener('click', this.decreaseLn);
		
		this.shadow.appendChild(this.decreaseBtn);
	}
	
	function createIncreaseBtnElement() {
		this.increaseBtn = document.createElement('button');
		this.increaseLn = () => {
			increase.call(this);
		};
		
		this.increaseBtn.innerText = increaseBtnText;
		this.increaseBtn.classList.add(counterBtnCls);
		this.increaseBtn.classList.add(increaseBtnCls);
		this.increaseBtn.addEventListener('click', this.increaseLn);
		
		this.shadow.appendChild(this.increaseBtn);
	}
	
	function createStyle() {
		const style = document.createElement('style');
		
		style.textContent = `
			:host .counter-field,
			:host .counter-btn {
				vertical-align: top;
			}
			
			.counter-field,
			.counter-btn {
				display: inline-block;
				padding: 0 .75rem;
				border: 1px solid #D9D9D9;
			}
		
			.counter-field {
				user-select: none;
				height: 2.375rem;
				line-height: 2.375rem;
				box-sizing: border-box;
			}
		
			.counter-btn {
				width: 2.375rem;
				height: 2.375rem;
				background-color: #FAFAFA;
				transition: background-color .25s ease-in-out;
			}
			
			.counter-btn:focus {
				outline: none;
			}
			
			.counter-btn:active {
				background-color: #CACACA !important;
			}
			
			.counter-btn:hover:not(:disabled) {
				cursor: pointer;
				background-color: #E2E2E2;
			}
			
			.counter-btn:disabled {
				opacity: .5;
				cursor: not-allowed;
			}
			
			.increase-btn {
				border-radius: .125rem .125rem 0 0;
				border-left: none;
			}
			
			.decrease-btn {
				border-radius: 0 0 .125rem .125rem;
				border-right: none;
			}
		`;
		
		this.shadow.appendChild(style);
	}
	
	function decrease() {
		let value = parseInt(this.text.innerText, 10);
		let event;
		
		value--;
		
		event = new CustomEvent('valueChanged', {
			detail: value
		});
		
		this.increaseBtn.disabled = null;
		
		if (this.hasAttribute('min')) {
			const min = parseInt(this.getAttribute('min'), 10);
			
			if (value < min) {
				return;
			} else if (value === min) {
				this.decreaseBtn.disabled = true;
			}
		}
		
		this.text.innerText = value.toString();
		this.value = value;
		
		this.dispatchEvent(event);
	}
	
	function increase() {
		let value = parseInt(this.text.innerText, 10);
		let event;
		
		value++;
		
		event = new CustomEvent('valueChanged', {
			detail: value
		});
		
		this.decreaseBtn.disabled = null;
		
		if (this.hasAttribute('max')) {
			const max = parseInt(this.getAttribute('max'), 10);
			
			if (value > max) {
				return;
			} else if (value === max) {
				this.increaseBtn.disabled = true;
			}
		}
		
		this.text.innerText = value.toString();
		this.value = value;
		
		this.dispatchEvent(event);
	}
	
	function disableButtons(value) {
		const { increaseBtn, decreaseBtn } = this;
		
		if (!(increaseBtn instanceof HTMLElement) || !(decreaseBtn instanceof HTMLElement)) {
			return;
		}
		
		this.increaseBtn.disabled = null;
		this.decreaseBtn.disabled = null;
		
		if (value === this.min) {
			this.decreaseBtn.disabled = true;
		}
		
		if (value === this.max) {
			this.increaseBtn.disabled = true;
		}
	}
	
	return CounterElement;
})();

customElements.define('my-counter', CounterElement);
