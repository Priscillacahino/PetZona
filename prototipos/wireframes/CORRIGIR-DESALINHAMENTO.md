# Corrigir as telas já importadas

Esta atualização corrige um erro do gerador: os grupos horizontais recebiam altura fixa de 1 pixel, em vez de acompanhar a altura do conteúdo. Isso podia sobrepor campos, textos, cartões e navegação. Também foram corrigidas as regras de largura dos cabeçalhos e a altura dos botões com quebra de linha.

## Aplicar a correção

1. Use o arquivo corrigido [plugin/code.js](./plugin/code.js) desta pasta. Para baixar o conjunto, use **Code → Download ZIP** na página principal do repositório e extraia o ZIP.
2. Abra a pasta **que você usou para importar o plugin no Figma**. Pelo caminho mostrado na sua captura, ela termina em `Petzona-wireframes-Figma/Petzona-wireframes/plugin`.
3. Substitua o **code.js** antigo pelo corrigido. O nome deve continuar **code.js**; se o download acrescentar `(1)`, renomeie antes de substituir.
4. Abra a página do Figma onde aparecem as telas desalinhadas.
5. Execute novamente **PetZona · Importar wireframes** em **Plugins → Desenvolvimento**.

O plugin atualizado procura a seção original chamada **PetZona · Wireframes editáveis · 430 × 932** e reorganiza seus elementos. Mantém os nós, textos e conexões. Quando essa seção está na página atual, ele não gera outro conjunto de telas.

Se você renomeou a seção, restaure o nome acima antes de executar. Se estiver em uma página vazia, o plugin cria um novo conjunto com as regras corrigidas.

Ao terminar, ele deve selecionar **01 · Início** e exibir a quantidade de telas reorganizadas. Confira a tela ampliada e teste a rolagem em **Present**. Depois, duplique um frame e reduza a largura para 390 ou 360 px para revisar a adaptação.

## Verificação realizada

- A causa foi identificada no código de geração de Auto Layout.
- Sintaxe JavaScript validada.
- Teste de regressão estrutural com 18 cenários: grupos de 1 px passam a acompanhar o conteúdo; alturas fixas de cabeçalho e ilustração são preservadas; nós, textos e conexões permanecem; executar o reparo novamente não cria nós.
- O teste estrutural usa objetos simulados. **Não substitui a execução e a inspeção visual no Figma.** O limite de chamadas da integração impediu concluir a revisão automatizada no Figma. A confirmação visual ainda depende de executar esta atualização no aplicativo.
