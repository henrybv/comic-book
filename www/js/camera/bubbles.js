var createBubbleStyle = function(bubbleName) {

    //Splits the bubbles name up into its properties and sets it to an array
    var bubbletype = bubbleName.split('_')

    var pointer = {
        content: '',
        position: 'absolute',
        'border-style': 'solid',
        'border-color': '#FFFFFF transparent',
        display: 'block',
        width: '0',
        'z-index': '1',
        'margin-left': '-6px'
    }
    var pointerBorder = {
          content: " ",
          position: 'absolute',
          'border-style': 'solid',
          'border-color': 'rgb(0, 0, 0) transparent',
          'display': 'block',
          'width': '0px',
          'z-index': '0',
          'margin-left': '-8px'
    }

    var thoughtBubbleBig = {
        'position': 'absolute',
        'border-style': 'solid',
        'border-radius': '2px',
        'border-width': '2px',
        'border-color': 'black',
        'background': 'white',
        'height': '25px',
        'width': '25px',
        'z-index': '4',
        // 'margin-left': '-6px',
        'border-radius': '50%'

    }        
    
    var thoughtBubbleSmall = {
        'position': 'absolute',
        'border-style': 'solid',
        'border-radius': '2px',
        'border-width': '2px',
        'border-color': 'black',
        'background': 'white',
        'height': '15px',
        'width': '15px',
        'z-index': '4',
        'margin-left': '-6px',
        'border-radius': '50%'
    } 
    console.log(bubbletype)
    //['left', 'top']


    if (bubbletype[2] === 'speech'){

        //Left vs Right
        if (bubbletype[0] === 'left') {
            pointer['left'] = '30%';
            pointerBorder['left'] = '30%';
        } else if (bubbletype[0] === 'right') {
            pointer['right'] = '30%';
            pointerBorder['right'] = '28%';
        }

        //Top vs Bottom
        if (bubbletype[1] === 'top'){
            pointer['top'] = '-31px';
            pointerBorder['top'] = "-37px"
            pointer['border-width'] = '0px 4px 35px';
            pointerBorder['border-width'] = '0px 6px 39px';
        } else if (bubbletype[1] === 'bottom') {
            pointer['bottom'] = '-32px';
            pointerBorder['bottom'] = '-39px';
            pointer['border-width'] = '35px 4px 0';
            pointerBorder['border-width'] = '40px 6px 0px';
        }

        return [pointer, pointerBorder]
    }

    if (bubbletype[2] === 'thought'){
        
        //Left vs Right
        if (bubbletype[0] === 'left') {
            thoughtBubbleBig['left'] = '15%';
            thoughtBubbleSmall['left'] = '30%';
        } else if (bubbletype[0] === 'right') {
            thoughtBubbleBig['right'] = '15%';
            thoughtBubbleSmall['right'] = '25%';
        }

        //Top vs Bottom
        if (bubbletype[1] === 'top'){
            thoughtBubbleBig['top'] = '-18px';
            thoughtBubbleSmall['top'] = "-30px";
        } else if (bubbletype[1] === 'bottom') {
            thoughtBubbleBig['bottom'] = '-18px';
            thoughtBubbleSmall['bottom'] = '-30px';

        }

        return [thoughtBubbleBig, thoughtBubbleSmall]

    }

}