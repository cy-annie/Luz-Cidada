# Plano de Gestão de Configuração — Luz Cidadã

## 1. Objetivo

Definir as práticas de Gestão de Configuração de Software (GCS) utilizadas no desenvolvimento do projeto Luz Cidadã, garantindo organização, controle de versões e colaboração entre os integrantes.

O Git será utilizado para controle de versão e o GitHub como repositório remoto.

## 2. Itens de Configuração

Serão controlados pelo Git:

- Código-fonte da aplicação;
- Documentação do projeto;
- Arquivos de configuração;
- Testes;
- Requisitos e demais documentos relacionados ao sistema.

## 3. Convenções de Nomeação

Os arquivos e pastas utilizarão nomes descritivos, preferencialmente em letras minúsculas e com `_` para separar palavras.

Exemplos:

- `cadastro_morador.py`
- `cadastro_tecnico.py`
- `docs/`
- `tests/`

As branches seguirão os padrões:

```text
feature/nome-da-funcionalidade
fix/nome-do-problema
docs/nome-da-documentacao