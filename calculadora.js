const form = document.querySelector('#form-btu');
const result = document.querySelector('#btu-resultado');
const formatCapacity = new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 2 });

form.addEventListener('input', () => {
  result.value = '';
});

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const { area, pessoas, aparelhos, uso, sol } = form.elements;
  const factor = uso.value === 'comercial' || sol.value === 'forte' ? 800 : 600;
  const extraPeople = Math.max(pessoas.valueAsNumber - 1, 0);
  const capacity = factor * (area.valueAsNumber + extraPeople + aparelhos.valueAsNumber);

  if (!Number.isFinite(capacity) || capacity > Number.MAX_SAFE_INTEGER) {
    result.value = 'Os valores informados são muito altos. Revise os campos e calcule novamente.';
    return;
  }

  result.value = 'Estimativa inicial: ' + formatCapacity.format(capacity) + ' BTU/h';
});

const calculator = document.querySelector('#calculadora');
const openCalculator = document.querySelector('#abrir-calculadora');

openCalculator.addEventListener('click', () => calculator.showModal());
calculator.addEventListener('close', () => openCalculator.focus());
openCalculator.hidden = false;
