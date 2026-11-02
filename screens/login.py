import streamlit as st


# =========================
# CONFIGURAÇÃO DA PÁGINA
# =========================

st.set_page_config(
    page_title="Luz Cidadã",
    page_icon="💡",
    layout="centered"
)


# =========================
# USUÁRIOS DE TESTE
# =========================

USUARIOS = {
    "morador@luzcidada.com": {
        "senha": "123456",
        "nome": "Morador",
        "perfil": "morador"
    },
    "tecnico@luzcidada.com": {
        "senha": "123456",
        "nome": "Técnico",
        "perfil": "tecnico"
    },
    "gestor@luzcidada.com": {
        "senha": "123456",
        "nome": "Gestor",
        "perfil": "gestor"
    }
}


# =========================
# ESTILO
# =========================

def aplicar_estilo():

    st.markdown(
        """
        <style>

        /* Fundo */
        .stApp {
            background-color: #eef1f5;
        }

        /* Área principal */
        .block-container {
            max-width: 650px;
            padding-top: 60px;
            padding-bottom: 60px;
        }

        /* Card */
        div[data-testid="stVerticalBlockBorderWrapper"] {
            background-color: white;
            border-radius: 22px;
            border: none;
            box-shadow: 0 10px 30px rgba(25, 52, 91, 0.10);
            padding: 25px;
        }

        /* Títulos */
        .logo-text {
            color: #19345b;
            font-size: 30px;
            font-weight: 700;
            text-align: center;
            margin-bottom: 5px;
        }

        .subtitle-text {
            color: #737b87;
            font-size: 15px;
            text-align: center;
            margin-bottom: 30px;
        }

        .title-text {
            color: #19345b;
            font-size: 24px;
            font-weight: 700;
            text-align: center;
            margin-bottom: 5px;
        }

        .description-text {
            color: #7a828d;
            font-size: 14px;
            text-align: center;
            margin-bottom: 25px;
        }

        /* Labels */
        label {
            color: #19345b !important;
            font-weight: 600 !important;
        }

        /* Campos */
        input {
            border-radius: 10px !important;
        }

        /* Botão */
        div.stFormSubmitButton > button {
            width: 100%;
            height: 48px;
            border-radius: 10px;
            background-color: #19345b;
            color: white;
            border: none;
            font-weight: 600;
            margin-top: 10px;
        }

        div.stFormSubmitButton > button:hover {
            background-color: #254879;
            color: white;
        }

        </style>
        """,
        unsafe_allow_html=True
    )


# =========================
# LOGIN
# =========================

def realizar_login(email, senha):

    if email in USUARIOS and USUARIOS[email]["senha"] == senha:

        st.session_state["autenticado"] = True
        st.session_state["usuario"] = USUARIOS[email]

        st.rerun()

    else:

        st.error("E-mail ou senha inválidos.")


def tela_login():

    aplicar_estilo()

    # Card principal
    with st.container(border=True):

        # Logo
        st.markdown(
            '<div class="logo-text">💡 Luz Cidadã</div>',
            unsafe_allow_html=True
        )

        # Subtítulo
        st.markdown(
            '<div class="subtitle-text">'
            'Sistema de monitoramento da iluminação pública'
            '</div>',
            unsafe_allow_html=True
        )

        # Título
        st.markdown(
            '<div class="title-text">Acesse sua conta</div>',
            unsafe_allow_html=True
        )

        # Descrição
        st.markdown(
            '<div class="description-text">'
            'Entre com seus dados para continuar.'
            '</div>',
            unsafe_allow_html=True
        )

        # Formulário
        with st.form("login_form"):

            email = st.text_input(
                "E-mail",
                placeholder="Digite seu e-mail"
            )

            senha = st.text_input(
                "Senha",
                placeholder="Digite sua senha",
                type="password"
            )

            entrar = st.form_submit_button("Entrar")

            if entrar:
                realizar_login(email, senha)


# =========================
# APLICAÇÃO
# =========================

def main():

    if "autenticado" not in st.session_state:
        st.session_state["autenticado"] = False

    if not st.session_state["autenticado"]:

        tela_login()

        return

    usuario = st.session_state["usuario"]

    st.title("Luz Cidadã")

    st.write(
        f"Bem-vindo, {usuario['nome']}!"
    )

    st.write(
        f"Perfil: {usuario['perfil']}"
    )

    if st.button("Sair"):

        st.session_state["autenticado"] = False

        st.session_state.pop(
            "usuario",
            None
        )

        st.rerun()


if __name__ == "__main__":
    main()