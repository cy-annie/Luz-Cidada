import streamlit as st
from screens.login import tela_login


def main():
    if "autenticado" not in st.session_state:
        st.session_state["autenticado"] = False

    if not st.session_state["autenticado"]:
        tela_login()
        return

    usuario = st.session_state["usuario"]

    st.title("Luz Cidadã")
    st.write(f"Bem-vindo, {usuario['nome']}!")

    if st.button("Sair"):
        st.session_state["autenticado"] = False
        st.session_state.pop("usuario", None)
        st.rerun()


if __name__ == "__main__":
    main()