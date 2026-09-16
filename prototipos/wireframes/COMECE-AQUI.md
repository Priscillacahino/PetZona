# PetZona · Wireframes para revisão

**Atualização v2 — correção de alinhamento:** se você já importou as telas, siga **CORRIGIR-DESALINHAMENTO.md**. Basta substituir o `code.js` do plugin já importado e executá-lo na página das telas. A atualização reorganiza a seção existente.

Paleta aprovada: azul bebê, ameixa, lilás e azul escuro. Base dos frames: **iPhone 16 Plus, 430 × 932**. As ilustrações são vetoriais e podem ser substituídas pelas fotos finais.

## 1. Primeiro, veja e experimente

Abra **Petzona-preview.html** no navegador do seu computador. O arquivo funciona sozinho, sem instalar dependências. Use o índice lateral para visitar as telas e o seletor de largura para comparar **360, 390, 430 e 768 px**. Em uma janela estreita, a prévia também acompanha a largura disponível.

Percursos sugeridos:

- **Compra:** Início → Produtos → Bebedouro → Adicionar ao carrinho → Pagamento → Concluir compra demonstrativa.
- **Banho e tosa:** Serviços → Banho e tosa → Agendar → Confirmar.
- **Spa Pet:** Serviços → Spa Pet → Reservar diária → informar rotina e cuidados → Confirmar.
- **Táxi Pet:** Serviços → Táxi Pet → Agendar transporte → retirada, destino e opção de volta → Confirmar.

Na prévia HTML, quantidades, total, busca, categorias, dia, horário, pet e ida/volta podem ser alterados. A reserva confirmada conserva as escolhas. O carrinho demonstra **um tipo de produto por vez**; adicionar outro produto substitui esse cenário. O acesso, pagamento e agendamento são simulações, sem envio de dados ou cobrança. O estado é reiniciado quando o arquivo é recarregado.

## 2. Caminho simples: levar os SVGs para o Figma

1. Baixe o repositório em **Code → Download ZIP**, extraia-o e abra a pasta **prototipos/wireframes**.
2. Abra um arquivo **Figma Design**.
3. Arraste os arquivos da pasta **telas-svg** para o canvas.
4. Organize e compare as telas com a visão geral.

Cada SVG tem **430 × 932** e representa a área visível da tela. SVG é uma base vetorial; a importação pode converter textos em contornos e não acrescenta Auto Layout nem conexões de protótipo. Use o próximo caminho para gerar as camadas nativas.

## 3. Caminho completo: camadas nativas e Auto Layout

Este caminho usa o **aplicativo Figma para computador**. A documentação do Figma exige o aplicativo desktop para carregar e testar plugins locais. [Guia oficial](https://developers.figma.com/docs/plugins/plugin-quickstart-guide/).

1. Extraia o ZIP, mantendo **manifest.json** e **code.js** juntos na pasta **plugin**.
2. No Figma desktop, abra o arquivo Design em que deseja trabalhar.
3. Clique com o botão direito no canvas e procure **Plugins → Development → Import plugin from manifest…**.
4. Selecione **plugin/manifest.json**.
5. Em **Plugins → Development**, execute **PetZona · Importar wireframes**.
6. Aguarde a mensagem de conclusão. O gerador cria uma seção com as telas, os componentes e as instruções.

O procedimento de importação por manifest é descrito pelo [Figma neste guia](https://help.figma.com/hc/en-us/articles/38457121114263-Create-a-Figma-Design-plugin-with-the-Figma-MCP-server-and-agentic-tools). O nome dos menus pode aparecer em inglês.

Se sua versão pedir um identificador de plugin, use **Plugins → Development → New plugin**, escolha Figma Design e um plugin sem interface. Salve a pasta criada pelo Figma e substitua somente o **code.js** gerado pelo nosso **plugin/code.js**. Preserve o identificador atribuído pelo Figma no manifest. Não é necessário compilar código, instalar Node ou publicar o plugin.

O gerador cria uma seção na página atual quando ela ainda não existe. Ao encontrar a seção original do PetZona, a versão v2 aplica o reparo de alinhamento às telas já importadas, preservando seu conteúdo e suas conexões. Ele usa a API nativa do Figma e não faz requisições de rede.

## 4. Como trabalhar a responsividade no Figma

Após gerar as camadas nativas:

1. Selecione o **frame externo de uma tela**, por exemplo “01 · Início”.
2. Duplique-o para manter sua base em 430 × 932.
3. Altere a largura **W** para **390**, depois **360**, ou **768**.
4. Use o redimensionamento normal; evite a ferramenta **Scale**, que amplia tudo proporcionalmente.
5. Observe os textos quebrando linha e os grupos preenchendo a largura. As imagens e os ícones mantêm suas dimensões.
6. Em **Present**, role a região central das telas longas. Cabeçalho, ação final e navegação ficam fora dessa região.

Os frames usam Auto Layout, Fill container e alturas ajustadas ao conteúdo. Isso prepara a adaptação à largura; **o ajuste final precisa ser conferido no Figma após a importação**, especialmente em textos alterados ou fotos acrescentadas. Os SVGs não têm esse comportamento automático.

## Telas incluídas

| Número | Tela |
|---|---|
| 00 | Login complementar ao desafio |
| 01 | Início |
| 02 | Produtos e categorias |
| 03 | Detalhes do produto |
| 04 | Carrinho |
| 05 | Pagamento |
| 06 | Serviços |
| 07 | Profissionais |
| 08 | Perfil do profissional / serviço |
| 09 | Agendamento |
| 10 | Confirmação do agendamento |

Há ainda **sete variações**: conclusão da compra; perfil, agendamento e confirmação do Spa Pet; perfil, agendamento e confirmação do Táxi Pet. Total: **18 cenários**.

As conexões do gerador Figma percorrem cenários predefinidos. Os controles de quantidade, filtros, campos, seleção de produto, dia e horário não executam a lógica do HTML dentro do Figma. Ajuste esses estados no arquivo ou acrescente variáveis/interações conforme a prototipação evoluir. O cenário de compra no Figma usa o bebedouro como exemplo.

## Paleta e critérios de composição

| Uso | Cor |
|---|---|
| Fundo azul bebê | `#DDEDFA` |
| Ação principal, ameixa | `#65416F` |
| Apoio, azul | `#596D9E` |
| Superfícies lilás | `#DFD2EC` |
| Apoio azul claro | `#BED7ED` |
| Texto principal | `#26364F` |
| Texto secundário | `#596477` |
| Superfícies | `#FFFFFF` |

- Margens de referência: 20 px.
- Espaçamentos: 8, 12, 16, 20 e 24 px.
- Corpo: 16 px. Legendas: 12–14 px. Títulos: 20–30 px.
- Botão principal: pelo menos 52 px. Controles compactos: pelo menos 44 px.
- Fonte nativa do Figma: Inter. HTML e SVG usam Arial com fontes alternativas locais para funcionar sem downloads.
- Área superior: 48 px; cabeçalho: 64 px; área inferior: 22 px. São medidas de composição do protótipo, não uma implementação nativa de safe areas do iOS.

Pares de texto calculados: branco sobre ameixa **8,27:1**; ameixa sobre lilás **5,74:1**; azul escuro sobre branco **12,19:1**; texto secundário sobre azul bebê **5,00:1**. Essas medições não substituem uma avaliação completa de acessibilidade.

## O que foi verificado

- Sintaxe dos arquivos JavaScript e geração dos 18 cenários.
- Lógica da prévia: carrinho, valores, busca, filtros, pagamento demonstrativo, Spa Pet e Táxi Pet com ida/volta, alteração da reserva e validação de endereços.
- Renderização vetorial offline e inspeção visual da visão geral.
- Cálculo da composição dos SVGs nas larguras 360, 390, 430 e 768 px.

**Limites da verificação:** a primeira versão foi executada no Figma pela autora e apresentou desalinhamento. A versão v2 corrige a configuração de altura dos grupos e inclui um reparo para as telas existentes; sua execução ainda precisa ser conferida visualmente no Figma. A revisão automatizada no Figma ficou pendente por limite de chamadas da integração. Os testes da lógica e do reparo estrutural foram executados em Node; as imagens foram renderizadas a partir dos SVGs. A prévia HTML ainda requer conferência visual no navegador.

## Contexto acadêmico

O **Petzona** foi desenvolvido como projeto final do **Workshop da Fábrica de Software 2026.1**. O desafio fez parte do processo de avaliação para ingresso na equipe de **UX/UI do projeto Adm4All**, permitindo colocar em prática os conhecimentos apresentados durante o workshop.

Este pacote é uma base para a prototipação. Os links finais do Figma poderão entrar no README quando você concluir sua revisão.

## Arquivos de apoio

- **Petzona-visao-geral.svg:** visão das dez telas principais e do login.
- **telas-svg/:** 18 telas separadas.
- **plugin/:** gerador de camadas nativas.
- **fontes/:** estrutura das telas, estilos, comportamento e scripts de geração/verificação.

Para uma futura edição técnica, altere os arquivos em `fontes` e execute `python3 fontes/build.py` para reconstruir o HTML e o gerador. Isso é opcional: os arquivos entregues já estão prontos para abrir/importar.
