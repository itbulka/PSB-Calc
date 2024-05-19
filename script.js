// Получение узлов
const buttons = document.querySelectorAll('.button_number');
const display = document.getElementById('display');
const buttonClear = document.querySelector('.button_clear-all');
const buttonClearSymbol = document.querySelector('.button_clear-symbol');
const buttonEquel = document.querySelector('.button_equel');
const buttonCopy = document.querySelector('.button_copy');

// Вешаем на кнопки обработчики для добавления чисел на инпут
buttons.forEach(button => {
	button.addEventListener('click', e => {
		display.value += e.target.textContent;
	});
});

// Обрабатываем события клавиатуры
document.addEventListener('keydown', function (event) {
	const key = event.key;
	console.log(key);
	const validKeys = /[0-9+\-*\/().=]|Backspace|Delete|Enter|Escape/;
	if (validKeys.test(key)) {
		if (key === 'Enter') {
			calculate();
		} else if (key === 'Backspace') {
			clearSymbol();
		} else if (key === 'Escape') {
			clearAll();
		} else {
			display.value += key;
		}
	}
});

// Чистка инпута
buttonClear.addEventListener('click', () => clearAll());

// Удаление последнего символа
buttonClearSymbol.addEventListener('click', () => clearSymbol());

// Вывести результат
buttonEquel.addEventListener('click', () => calculate());

// Скопировать все в буфер обмена что находится в инпуте
buttonCopy.addEventListener('click', () => {
	navigator.clipboard
		.writeText(display.value)
		.then(() => {
			console.log('Success');
			setTimeout(() => {
				buttonCopy.textContent = 'Copy';
			}, 1000);
			buttonCopy.textContent = 'Copied';
		})
		.catch(err => {
			console.log('Error', err);
		});
});

// utils
// Функция вычисления выражения
function evaluateExpression(expression) {
	const operators = {
		'+': (a, b) => a + b,
		'-': (a, b) => a - b,
		'*': (a, b) => a * b,
		'/': (a, b) => a / b,
	};

	const precedence = {
		'+': 1,
		'-': 1,
		'*': 2,
		'/': 2,
	};

	const isOperator = token => token in operators;
	const isHigherPrecedence = (op1, op2) => precedence[op1] >= precedence[op2];
	const applyOperator = (op, b, a) => operators[op](a, b);

	const stack = [];
	const output = [];

	const tokens = expression.match(/\d+|\+|\-|\*|\/|\(|\)/g);

	tokens.forEach(token => {
		if (/^\d+$/.test(token)) {
			output.push(parseFloat(token));
		} else if (token === '(') {
			stack.push(token);
		} else if (token === ')') {
			while (stack.length > 0 && stack[stack.length - 1] !== '(') {
				output.push(stack.pop());
			}
			if (stack.length === 0) throw new Error('Несбалансированные скобки');
			stack.pop();
		} else {
			while (
				stack.length > 0 &&
				isHigherPrecedence(stack[stack.length - 1], token)
			) {
				output.push(stack.pop());
			}
			stack.push(token);
		}
	});

	while (stack.length > 0) {
		const token = stack.pop();
		if (token === '(') throw new Error('Несбалансированные скобки');
		output.push(token);
	}

	const resultStack = [];
	output.forEach(token => {
		if (/^\d+$/.test(token)) {
			resultStack.push(parseFloat(token));
		} else if (isOperator(token)) {
			const b = resultStack.pop();
			const a = resultStack.pop();
			if (b === 0 && token === '/') throw new Error('Деление на ноль');
			resultStack.push(applyOperator(token, b, a));
		}
	});

	if (resultStack.length !== 1) throw new Error('Некорректное выражение');
	return resultStack[0];
}

function calculate() {
	try {
		display.value = evaluateExpression(display.value);
	} catch (error) {
		display.value = `${error.message}`;
	}
}

function clearSymbol() {
	display.value = display.value.slice(0, -1);
}

function clearAll() {
	display.value = '';
}
