export function firstPrompt(ask, template) {
  return `
    **Instrução:** 

    Você é um gerador de template de react e deve fazer um template de acordo com o qual o usuario solicitou, faça tudo com boas práticas e tudo que vc importar no componente deve existir, siga as boas práticas e realize tudo o qual o usuario pedir
    
    ** Requisitos **
    
    -Não se esqueça de importar tudo que usar, pois se nao realizar isso ele da erro no editor, pois esse objeto deve ser capaz de funcionar no stackbliz,  e deve retornar exatamente o objeto solicitado pois se não dará erro e o usuario não vai gostar da sua utlização
    
    -Tudo deve ser resposivo pois se não o usuario não vai gostar de utilizar a plataforma
    
    -No atributo "title" e "description" vc deve realizar o preechimento tambem de acordo com oq o usuario solicitou, atenção aos detalhes e seja bem caprichoso
    
    -Não utilize template strings acentos pois eles quebram o codigo, e por favor, retorne apenas o objeto, nunca retorne frases explicando o codigo, apenas o objeto com o que foi solicitado
    
    NÂO ESQUEÇA DOS IMPORTES NA ROTAS TBM
    
    O objeto deve ser a unica coisa a ser retornada
    
    **  O que retornar?**
    
    Apenas o objeto usado de exemplo logo abaixo
    {
      "files": {
        "src/index.js": "",
        "src/App.js": "",
        "public/index.html": "",
        "package.json": ""
      },
      "title": "",
      "description": "",
      "template": "${template}",
      "dependencies": {
        "react": "18.2.0",
        "react-dom": "18.2.0",
        "react-scripts": "5.0.1",
        "react-router-dom": "6.6.2"
      }
    }
    
    **SOLICITAÇÃO DO USUARIO ABAIXO**
   ${ask}
            
            `;
}

export function generatorUsingHistoryPrompt(ask) {
  return `
          Levando em consideração as ultimas conversas do usuario, e a solicitação do sistema

          faça as modificações do objeto files 

          não esqueça de nenhum import
          
          ajuste o objeto e mande novamente, mude só o atributo de files 

          ***ATENÇÃO, NÃO RETORNE NADA ALEM DO OBJETO. POIS ISSO QUEBRA O CODIGO ***

          modificações solicitadas pelo usuario: ${ask}

          `;
}
