//CONTROLLER FUNCTION
//OLD SKETCH FILTER
    // $scope.filterImage = function(filterType, canvasId){
    //     // var canvas = $scope.canvas;
    //     var canvas = document.getElementById(canvasId);
    //     var filterType = filterType || 'sketch';
    //     var context = canvas.getContext('2d');
    //     var imageData = context.getImageData(0,0, canvas.width, canvas.height);
    //     var finalImageData;
    //     if (filterType === 'sketch'){
    //         var a = Grafi.edge(imageData, {level: 20});
    //         var b = Grafi.invert(a)
    //             // for (var i=0; i < a.length; i+=4){
    //             //   a[i]     = 255 - a[i];     // red
    //             //   a[i + 1] = 255 - a[i + 1]; // green
    //             //   a[i + 2] = 255 - a[i + 2]; // blue
    //             // }
    //         var c = Grafi.contrast(a)
    //         // var c = Grafi.brightness(a);
    //         finalImageData = c;
    //     }
    //     if (filterType === 'posterize'){
    //         finalImageData = Grafi.posterize(imageData)
    //     }
    //     context.putImageData(finalImageData, 0, 0);
    //     $scope.url = canvas.toDataURL('image/png');
    // }



core.factory('Grafi', function(){
  var Grafi = {};

  Grafi.GrafiImageData = function(pixelData, width, height) {
      this.width = width
      this.height = height
      this.data = pixelData
    }

    var checkColorDepth = function(dataset, width, height) {
      var colorDepth
      if (dataset.width && dataset.height) {
        // When ImageData object was passed as dataset
        colorDepth = dataset.data.length / (dataset.width * dataset.height)
      } else {
        // When just an array was passed as dataset
        colorDepth = dataset.length / (width * height)
      }

      if (colorDepth !== 4) {
        throw new Error('data and size of the image does now match')
      }
    }

    var formatter = function(pixelData, width, height) {
      console.log('in formatter with parameters:', pixelData, width, height)
      // check the size of data matches
      checkColorDepth(pixelData, width, height)

      if (!(pixelData instanceof Uint8ClampedArray)) {
        console.log('in if statement for no instance of Uint8ClampedArray')
        throw new Error('pixel data passed is not an Uint8ClampedArray')
      }

      // If window is available create ImageData using browser API,
      // otherwise call ImageData constructor
      if (typeof window === 'object') {
          console.log('in if statement for window is an oboject, ', new window.ImageData(pixelData, width, height))
          return new ImageData(pixelData, width, height);
        // return new window.ImageData(pixelData, width, height)
      }
      console.log('from formatter - new imagedata: ', new GrafiImageData(pixelData, width, height))
      return new GrafiImageData(pixelData, width, height);
    }

    var convolution = function(imgData, option) {
      // check options object & set default variables
      option = option || {}
      option.monochrome = option.monochrome || false
      option.divisor = option.divisor || 1
      option.median = option.median || false
      if (!option.filter || !option.radius) {
        throw new Error('Required options missing. filter : ' + option.filter + ', radius: ' + option.radius)
      }

      // Check length of data & avilable pixel size to make sure data is good data
      var pixelSize = imgData.width * imgData.height
      var dataLength = imgData.data.length
      var colorDepth = dataLength / pixelSize
      if (colorDepth !== 4 && colorDepth !== 1) {
        throw new Error('ImageObject has incorrect color depth')
      }
      var newPixelData = new Uint8ClampedArray(pixelSize * (option.monochrome || 4))

      var height = imgData.height
      var width = imgData.width
      var f = option.filter
      var r = option.radius
      var ch, y, x, fy, fx, arr, s, result, i

      // do convolution math for each channel
      for (ch = 0; ch < colorDepth; ch++) {
        for (y = r; y < height - r; y++) {
          for (x = r; x < width - r; x++) {
            i = (x + y * width) * colorDepth + ch
            if (ch === 3) {
              if (colorDepth === 4 && option.monochrome) {
                newPixelData[x + y * width] = imgData.data[x + y * width]
                continue
              }
              newPixelData[i] = imgData.data[i]
              continue
            }

            arr = []
            for (fy = -r; fy < r * 2; fy++) {
              for (fx = -r; fx < r * 2; fx++) {
                arr.push(imgData.data[(x + fx + (y + fy) * width) * colorDepth + ch])
              }
            }

            result = option.median
              ? arr.sort()[Math.floor(arr.length / 2)]
              : arr.map(function (data, index) { return data * f[index]}).reduce(function (p, n) { return p + n }) / option.divisor

            if (colorDepth === 4 && option.monochrome) {
              newPixelData[(x + y * width)] = result
              continue
            }
            newPixelData[i] = result
          }
        }

        for (y = 0; y < height; y++) {
          for (x = 0; x < width; x++) {
            if (colorDepth === 4 && option.monochrome) {
              // copy colors from top & bottom rows
              if (y < r || y > height - (r * 2)) {
                newPixelData[x + y * width] = imgData.data[x + y * width]
                continue
              }
              // copy colors from left and write columns
              if (x < r || x > width - (r * 2)) {
                newPixelData[x + y * width] = imgData.data[x + y * width]
              }
              continue
            }

            i = (x + y * width) * colorDepth + ch
            // copy colors from top & bottom rows
            if (y < r || y > height - (r * 2)) {
              newPixelData[i] = imgData.data[i]
              continue
            }
            // copy colors from left and write columns
            if (x < r || x > width - (r * 2)) {
              newPixelData[i] = imgData.data[i]
            }
          }
        }
      }
      return formatter(newPixelData, imgData.width, imgData.height)
    }

    

    Grafi.brightness = function(imgData, option) {
      console.log('in grafi factory brightness')
      // sanitary check for input data
      checkColorDepth(imgData)

      // check options object
      option = option || {}
      option.level = option.level || 0

      var pixelSize = imgData.width * imgData.height
      var level = option.level

      var newPixelData = new Uint8ClampedArray(pixelSize * 4)
      var pixel, index
      for (pixel = 0; pixel < pixelSize; pixel++) {
        index = pixel * 4
        newPixelData[index] = imgData.data[index] + level
        newPixelData[index + 1] = imgData.data[index + 1] + level
        newPixelData[index + 2] = imgData.data[index + 2] + level
        newPixelData[index + 3] = imgData.data[index + 3]
      }

      return formatter(newPixelData, imgData.width, imgData.height)
    }

  /**
    ## contrast method
    Brief description
    ### Parameters
      - imageData `Object`: ImageData object
      - option `Object` : Option object
    ### Example
        //code sample goes here
   */
    var grayscale = function(imgData, option) {
      console.log('in grafi factory grayscale with image data: ', imgData)

      // sanitary check for input data
      checkColorDepth(imgData)

      // set check options object & set default options if necessary
      option = option || {}
      option.mode = option.mode || 'luma'
      option.channel = option.channel || 'g'

      // different grayscale methods
      var mode = {
        'luma': function (r, g, b) {
          return 0.299 * r + 0.587 * g + 0.114 * b
        },
        'simple': function (r, g, b, a, c) {
          var ref = {r: 0, g: 1, b: 2}
          return arguments[ref[c]]
        },
        'average': function (r, g, b) {
          return (r + g + b) / 3
        }
      }

      var pixelSize = imgData.width * imgData.height
      var newPixelData = new Uint8ClampedArray(pixelSize * 4)
      var i, _grayscaled, _index

      // loop through pixel size, extract r, g, b values & calculate grayscaled value
      for (i = 0; i < pixelSize; i++) {
        _index = i * 4
        _grayscaled = mode[option.mode](imgData.data[_index], imgData.data[_index + 1], imgData.data[_index + 2], imgData.data[_index + 3], option.channel)
        newPixelData[_index] = _grayscaled
        newPixelData[_index + 1] = _grayscaled
        newPixelData[_index + 2] = _grayscaled
        newPixelData[_index + 3] = imgData.data[_index + 3]
      }
      return formatter(newPixelData, imgData.width, imgData.height)
  }

      Grafi.grayscale = function(imgData, option) {
      console.log('in grafi factory grayscale with image data: ', imgData)

      // sanitary check for input data
      checkColorDepth(imgData)

      // set check options object & set default options if necessary
      option = option || {}
      option.mode = option.mode || 'luma'
      option.channel = option.channel || 'g'

      // different grayscale methods
      var mode = {
        'luma': function (r, g, b) {
          return 0.299 * r + 0.587 * g + 0.114 * b
        },
        'simple': function (r, g, b, a, c) {
          var ref = {r: 0, g: 1, b: 2}
          return arguments[ref[c]]
        },
        'average': function (r, g, b) {
          return (r + g + b) / 3
        }
      }

      var pixelSize = imgData.width * imgData.height
      var newPixelData = new Uint8ClampedArray(pixelSize * 4)
      var i, _grayscaled, _index

      // loop through pixel size, extract r, g, b values & calculate grayscaled value
      for (i = 0; i < pixelSize; i++) {
        _index = i * 4
        _grayscaled = mode[option.mode](imgData.data[_index], imgData.data[_index + 1], imgData.data[_index + 2], imgData.data[_index + 3], option.channel)
        newPixelData[_index] = _grayscaled
        newPixelData[_index + 1] = _grayscaled
        newPixelData[_index + 2] = _grayscaled
        newPixelData[_index + 3] = imgData.data[_index + 3]
      }
      return formatter(newPixelData, imgData.width, imgData.height)
  }

    Grafi.contrast = function(imgData, option) {
      console.log('in Grafi contrast. imgData: ', imgData)
      // check options object
      option = option || {}
      option.monochrome = option.monochrome || false
      option.level = option.level || 1

      var pixelSize = imgData.width * imgData.height
      var dataLength = imgData.data.length
      var colorDepth = dataLength / pixelSize
      var level = option.level

      if (colorDepth !== 4 && colorDepth !== 1) {
        throw new Error('ImageObject has incorrect color depth')
      }

      var newPixelData = new Uint8ClampedArray(pixelSize * (option.monochrome || 4))
      var p, _i, _data
      for (p = 0; p < pixelSize; p++) {
        if (colorDepth === 1) {
          _data = (imgData.data[p] - 128) * level + 128

          // case 1. input is 1 channel and output should be 1 channel (monochrome)
          if (option.monochrome) {
            newPixelData[p] = _data
            continue
          }

          // case 2. input is 1 channel but output should be RGBA
          newPixelData[_i] = _data
          newPixelData[_i + 1] = _data
          newPixelData[_i + 2] = _data
          newPixelData[_i + 3] = 255
          continue
        }

        // case 3. input is RGBA  and output should also be RGBA
        _i = p * 4
        newPixelData[_i] = (imgData.data[_i] - 128) * level + 128
        newPixelData[_i + 1] = (imgData.data[_i + 1] - 128) * level + 128
        newPixelData[_i + 2] = (imgData.data[_i + 2] - 128) * level + 128
        newPixelData[_i + 3] = imgData.data[_i + 3]
      }

      return formatter(newPixelData, imgData.width, imgData.height)
    }
  /**
    ## despeckle method
    Brief description
    ### Parameters
      - imageData `Object`: ImageData object
      - option `Object` : Option object
    ### Example
        //code sample goes here
   */
    Grafi.despeckle = function(imgData, option) {
      // check options object & set default variables
      option = option || {}
      option.monochrome = option.monochrome || false
      option.type = option.type || 'median'

      var types = {
        median: [1, 1, 1, 1, 1, 1, 1, 1, 1],
        mean: [1, 1, 1, 1, 1, 1, 1, 1, 1]
      }
      if (!types[option.type]) {
        throw new Error('Could not find type of filter requested')
      }
      var f = types[option.type]
      return convolution(imgData, {
        filter: f,
        divisor: f.reduce(function (p, n) { return p + n }),
        radius: 1,
        monochrome: option.monochrome,
        median: (option.type === 'median')
      })
    }

  /**
    ## edge method
    Brief description
    ### Parameters
      - imageData `Object`: ImageData object
      - option `Object` : Option object
    ### Example
        //code sample goes here


   */
    Grafi.edge = function(imgData, option) {
      // check options object & set default variables
      option = option || {}
      console.log('edge option', option)
      option.monochrome = option.monochrome || false
      option.level = option.level || 1
      option.type = option.type || 'laplacian'

      // Check length of data & avilable pixel size to make sure data is good data
      var pixelSize = imgData.width * imgData.height
      var dataLength = imgData.data.length
      var colorDepth = dataLength / pixelSize
      if (colorDepth !== 4 && colorDepth !== 1) {
        throw new Error('ImageObject has incorrect color depth')
      }

      if (colorDepth === 4) {
        imgData = grayscale(imgData)
      }

      var types = {
        laplacian: [-1, -1, -1, -1, 8, -1, -1, -1, -1]
      }
      if (!types[option.type]) {
        throw new Error('Could not find type of filter requested')
      }

      var f = types[option.type]
      return convolution(imgData, {
        filter: f,
        divisor: f.length / option.level,
        radius: 1,
        monochrome: option.monochrome
      })
    }
    //   var pixelSize = imgData.width * imgData.height
    //   var newPixelData = new Uint8ClampedArray(pixelSize * 4)
    //   var i, _grayscaled, _index

    //   // loop through pixel size, extract r, g, b values & calculate grayscaled value
    //   for (i = 0; i < pixelSize; i++) {
    //     _index = i * 4
    //     _grayscaled = mode[option.mode](imgData.data[_index], imgData.data[_index + 1], imgData.data[_index + 2], imgData.data[_index + 3], option.channel)
    //     newPixelData[_index] = _grayscaled
    //     newPixelData[_index + 1] = _grayscaled
    //     newPixelData[_index + 2] = _grayscaled
    //     newPixelData[_index + 3] = imgData.data[_index + 3]
    //   }
    //   return formatter(newPixelData, imgData.width, imgData.height)
    // })
  /**
    ## invert method
    inverts color of an given image
    ### Parameters
      - imageData `Object`: ImageData object
    ### Example
        var input = { data: Uint8ClampedArray[400], width: 10, height: 10, }
        grafi.invert(input)
   */
  Grafi.invert = function(imgData) {
    checkColorDepth(imgData)
    var dataLength = imgData.data.length
    var newPixeldata = new Uint8ClampedArray(dataLength)
    var i
    for (i = 0; i < dataLength; i++) {
      // the image has Alpha channel, skip invert every 4th one
      if ((i + 1) % 4 === 0) {
        newPixeldata[i] = imgData.data[i]
        continue
      }
      newPixeldata[i] = 255 - imgData.data[i]
    }
    return formatter(newPixeldata, imgData.width, imgData.height)
  }

   // ## posterize method
//     posterize given image
//     ### Parameters
//       - imageData `Object`: ImageData object
//       - option `Object` : Option object
//           - level `Number` : posterize level, from 2 - 256
//     ### Example
//         var input = { data: Uint8ClampedArray[400], width: 10, height: 10 }
//         // posterlize in 4 levels
//         grafi.posterize(input, {level: 4})
//    */
  Grafi.posterize = function(imgData, option) {
    // make sure data is good data
    checkColorDepth(imgData)

    // check options object & set default variables
    option = option || {}
    option.level = option.level || 4

    var pixelSize = imgData.width * imgData.height
    var newPixelData = new Uint8ClampedArray(pixelSize * 4)

    var lookupTable = new Uint8Array(256)
    var colorSize = 256 / (option.level - 1)
    var stepSize = 256 / option.level
    var level, step, levelindex, pixel, index

    for (level = 0; level < option.level; level++) {
      for (step = 0; step < stepSize; step++) {
        levelindex = Math.round(level * stepSize + step)
        if (level === option.level - 1) {
          lookupTable[levelindex] = 255
          continue
        }
        lookupTable[levelindex] = level * colorSize
      }
    }

    for (pixel = 0; pixel < pixelSize; pixel++) {
      index = pixel * 4
      newPixelData[index] = lookupTable[imgData.data[index]]
      newPixelData[index + 1] = lookupTable[imgData.data[index + 1]]
      newPixelData[index + 2] = lookupTable[imgData.data[index + 2]]
      newPixelData[index + 3] = imgData.data[index + 3]
    }

    return formatter(newPixelData, imgData.width, imgData.height)
  }


  return Grafi;
})
