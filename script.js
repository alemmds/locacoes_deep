document.addEventListener('DOMContentLoaded', () => {
    const formContainer = document.getElementById('form-container');
    const listContainer = document.getElementById('list-container');
    const initialButtons = document.getElementById('initial-buttons');
    const welcomeMessage = document.getElementById('welcome-message'); // Referência à mensagem de boas-vindas
    const modal = document.getElementById('modal');
    const modalTitle = document.getElementById('modal-title');
    const modalBody = document.getElementById('modal-body');
    const backButton = document.getElementById('back-button');

    const categories = {
        machines: {
            fields: ['Nome', 'Série', 'Anos de Uso', 'Horas Trabalhadas'],
            data: []
        },
        receipts: {
            fields: ['Empresa', 'Valor', 'Data de Pagamento', 'Data de Término', 'Status'],
            data: []
        },
        contracts: {
            fields: ['Empresa', 'Locatário', 'CNPJ', 'Representante', 'Período de Locação', 'Equipamento', 'Data de Término', 'Operador'],
            data: []
        },
        accounts: {
            fields: ['Tipo', 'Data de Vencimento', 'Valor'],
            data: []
        },
        companies: {
            fields: ['Nome', 'CNPJ', 'Área de Atuação', 'Representante', 'Telefone', 'E-mail'],
            data: []
        }
    };

    let editingIndex = null;
    let currentCategory = null;
    let selectedItemIndex = null;

    const sidebarLinks = document.querySelectorAll('.sidebar ul li a');
    sidebarLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const category = e.target.getAttribute('data-category');
            currentCategory = category;
            editingIndex = null;

            // Esconde a mensagem de boas-vindas
            welcomeMessage.classList.add('hidden');

            // Mostra os botões iniciais
            showInitialButtons(category);

            // Mostra o botão "Voltar"
            backButton.style.display = 'block';
        });
    });

    function showInitialButtons(category) {
        formContainer.innerHTML = '';
        listContainer.innerHTML = '';
        initialButtons.innerHTML = `
            <button class="access-list" onclick="showList('${category}')">Acessar Lista</button>
            <button class="register-item" onclick="showForm('${category}')">Cadastrar Item</button>
        `;
    }

    window.showList = (category) => {
        initialButtons.innerHTML = '';
        listContainer.innerHTML = generateCards(category);
        formContainer.innerHTML = '';
        backButton.style.display = 'block';

        // Adiciona evento de clique aos cards
        const cards = document.querySelectorAll('.card');
        cards.forEach((card, index) => {
            card.addEventListener('click', () => {
                selectedItemIndex = index;
                showModal(category, index);
            });
        });

        // Adiciona funcionalidade de pesquisa
        const searchInput = document.createElement('input');
        searchInput.type = 'text';
        searchInput.id = 'search-input';
        searchInput.placeholder = 'Pesquisar por nome...';

        const searchButton = document.createElement('button');
        searchButton.id = 'search-button';
        searchButton.textContent = 'Pesquisar';

        const searchContainer = document.createElement('div');
        searchContainer.className = 'search-container';
        searchContainer.appendChild(searchInput);
        searchContainer.appendChild(searchButton);

        listContainer.prepend(searchContainer);

        searchButton.addEventListener('click', () => {
            const searchTerm = searchInput.value.toLowerCase();
            const cards = document.querySelectorAll('.card');
            cards.forEach(card => {
                const cardTitle = card.querySelector('h3').textContent.toLowerCase();
                if (cardTitle.includes(searchTerm)) {
                    card.style.display = 'block';
                } else {
                    card.style.display = 'none';
                }
            });
        });
    };

    window.showForm = (category) => {
        initialButtons.innerHTML = '';
        formContainer.innerHTML = generateForm(category);
        listContainer.innerHTML = '';
        backButton.style.display = 'block';

        const form = document.querySelector('form');
        form.addEventListener('submit', (e) => {
            e.preventDefault();
            const data = {};
            categories[category].fields.forEach(field => {
                data[field] = form.querySelector(`[name="${field}"]`).value;
            });

            if (editingIndex !== null) {
                categories[category].data[editingIndex] = data;
            } else {
                categories[category].data.push(data);
            }

            saveData(category);
            editingIndex = null;
            showInitialButtons(category);
        });
    };

    function generateForm(category) {
        return `
            <h2>${editingIndex !== null ? 'Editar' : 'Cadastrar'} ${category}</h2>
            <form>
                ${categories[category].fields.map(field => `
                    <label>${field}:</label>
                    <input type="text" name="${field}" required>
                `).join('')}
                <button type="submit">${editingIndex !== null ? 'Salvar Alterações' : 'Salvar'}</button>
            </form>
        `;
    }

    function generateCards(category) {
        return `
            <h2>Lista de ${category}</h2>
            <div class="cards-container">
                ${categories[category].data.map((item, index) => `
                    <div class="card" data-index="${index}">
                        <h3>${item[categories[category].fields[0]]}</h3>
                    </div>
                `).join('')}
            </div>
        `;
    }

    function saveData(category) {
        localStorage.setItem(category, JSON.stringify(categories[category].data));
    }

    function loadData() {
        Object.keys(categories).forEach(category => {
            const data = localStorage.getItem(category);
            if (data) {
                categories[category].data = JSON.parse(data);
            }
        });
    }

    window.showModal = (category, index) => {
        const item = categories[category].data[index];
        modalTitle.textContent = item[categories[category].fields[0]]; // Título do modal (primeiro campo)
        modalBody.innerHTML = categories[category].fields.map(field => `
            <p><strong>${field}:</strong> ${item[field]}</p>
        `).join('');
        modal.style.display = 'flex';
    };

    window.closeModal = () => {
        modal.style.display = 'none';
    };

    window.editItemFromModal = () => {
        editingIndex = selectedItemIndex;
        showForm(currentCategory);

        const item = categories[currentCategory].data[editingIndex];
        const form = document.querySelector('form');
        categories[currentCategory].fields.forEach(field => {
            form.querySelector(`[name="${field}"]`).value = item[field];
        });
        closeModal();
    };

    window.deleteItemFromModal = () => {
        if (confirm('Tem certeza que deseja excluir este item?')) {
            categories[currentCategory].data.splice(selectedItemIndex, 1);
            saveData(currentCategory);
            showList(currentCategory);
            closeModal();
        }
    };

    window.goBackToInitial = () => {
        showInitialButtons(currentCategory);
    };

    // Registrar Service Worker
    if ('serviceWorker' in navigator) {
        window.addEventListener('load', () => {
            navigator.serviceWorker.register('/service-worker.js')
                .then((registration) => {
                    console.log('Service Worker registrado com sucesso:', registration.scope);
                })
                .catch((error) => {
                    console.log('Falha ao registrar o Service Worker:', error);
                });
        });
    }

    // Carregar dados ao iniciar
    loadData();
});