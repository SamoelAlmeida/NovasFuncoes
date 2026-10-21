const form = document.querySelector('#form-lancamento');
const inputDescricao = document.querySelector('#descricao');
const inputValor = document.querySelector('#valor');
const selectTipo = document.querySelector('#tipo');
const listaUl = document.querySelector('#lista-lancamentos');
const spanTotalItens = document.querySelector('#total-itens');
const spanValorTotal = document.querySelector('#valor-total');
const botoesFiltro = document.querySelectorAll('.filtros button:not(#btn-ordenar)');
const btnSubmit = document.querySelector('#btn-submit');
const btnOrdenar = document.querySelector('#btn-ordenar');

let lancamentos = JSON.parse(localStorage.getItem('lancamentos_db')) || [];
let filtroAtual = 'todos';
let idEdicao = null;

const salvarStorage = () => {
  localStorage.setItem('lancamentos_db', JSON.stringify(lancamentos));
};

const renderizar = () => {
  listaUl.innerHTML = '';

  const itensFiltrados = lancamentos.filter(item => {
    if (filtroAtual === 'todos') return true;
    return item.tipo === filtroAtual;
  });

  itensFiltrados.forEach((item) => {
    const li = document.createElement('li');
    li.classList.add(item.tipo);
    
    li.innerHTML = `
-       <span>${item.descricao}<strong>R$ 
${item.valor.toFixed(2)}</strong></span>
      <div class="acoes">
        <button class="btn-editar" onclick="prepararEdicao(${item.id})">Editar</button>
        <button class="btn-deletar" onclick="removerItem(${item.id})">X</button>
      </div>
    `;

    listaUl.appendChild(li);
  });

  atualizarResumo();
};

const atualizarResumo = () => {
  spanTotalItens.textContent = lancamentos.length;

  const valorCalculado = lancamentos.reduce((acumulador, item) => {
    return item.tipo === 'receita' 
      ? acumulador + item.valor 
      : acumulador - item.valor;
  }, 0);

  spanValorTotal.textContent = valorCalculado.toFixed(2);
};

form.addEventListener('submit', (event) => {
  event.preventDefault();

  const valorNum = parseFloat(inputValor.value);
  if (valorNum <= 0) {
    alert("O valor não pode ser menor ou igual a zero!");
    return;
  }

  if (idEdicao) {
    lancamentos = lancamentos.map(item => {
      if (item.id === idEdicao) {
        return {
          ...item,
          descricao: inputDescricao.value,
          valor: valorNum,
          tipo: selectTipo.value
        };
      }
      return item;
    });
    idEdicao = null;
    btnSubmit.textContent = 'Adicionar';
  } else {
    const novoLancamento = {
      id: Date.now(),
      descricao: inputDescricao.value,
      valor: valorNum,
      tipo: selectTipo.value
    };

    lancamentos = [...lancamentos, novoLancamento];
  }

  salvarStorage();
  renderizar();

  form.reset();
  inputDescricao.focus();
});

window.prepararEdicao = (id) => {
  const itemParaEditar = lancamentos.find(item => item.id === id);
  if (itemParaEditar) {
    inputDescricao.value = itemParaEditar.descricao;
    inputValor.value = itemParaEditar.valor;
    selectTipo.value = itemParaEditar.tipo;
    idEdicao = id;
    btnSubmit.textContent = 'Atualizar';
    inputDescricao.focus();
  }
};

window.removerItem = (id) => {
  lancamentos = lancamentos.filter(item => item.id !== id);
  if (idEdicao === id) {
    idEdicao = null;
    form.reset();
    btnSubmit.textContent = 'Adicionar';
  }
  salvarStorage();
  renderizar();
};

botoesFiltro.forEach(botao => {
  botao.addEventListener('click', (e) => {
    filtroAtual = e.target.dataset.filtro;
    renderizar();
  });
});

if (btnOrdenar) {
  btnOrdenar.addEventListener('click', () => {
    lancamentos.sort((a, b) => b.valor - a.valor);
    salvarStorage();
    renderizar();
  });
}

renderizar();