(function(){

  var composeRegexGt = function composeRegexGt(num){
    var
      ret = "^0*(",
      numArr = (num + "").split(""),
      passedDigits = "";

    if(!numArr.length){ return ""; }
    ret += "[1-9]\\d{" + numArr.length + ",}";
    numArr.forEach(function(digit){
      digit = parseInt(digit, 10);

      if(digit === 9){
        passedDigits += digit;

        if(digit === 9 && passedDigits.length === numArr.length){
          ret += "|" + passedDigits;
        }

        return;
      }

      ret += "|"+passedDigits;
      passedDigits += digit;

      var
        digitsLeft = numArr.length - passedDigits.length,
        rangeFrom = (digit+(digitsLeft? 1 : 0));

      ret += rangeFrom === 9? "9" : "[" + rangeFrom + "-9]";

      if(passedDigits.length < numArr.length){
        ret += "\\d{" + digitsLeft + "}";
      }
    });
    ret += ")$";
    return ret;
  };
  var composeRegexLt = function composeRegexLt(num){
    var
      ret = "^0*(",
      numArr = (num + "").split(""),
      passedDigits = "";

    if(!numArr.length){ return ""; }

    numArr.forEach(function(digit){
      digit = parseInt(digit, 10);


    });
    ret += ")$";
    return ret;
  };

  document.getElementById("number").addEventListener("keyup", function(){
    document.getElementById("output").innerText = composeRegexGt(this.value);
  });

  window.testRegexGen = function(){
    var out = [], errors = [];
    for(var number=0; number<=500; number++){
      for(var probe=0; probe<=500; probe++){
        out[number] = out[number] || [];
        var regex = composeRegexGt(number);
        var result = !!(probe + "").match( new RegExp( regex ) );
        var item = {
          probe: probe,
          number: number,
          result: result,
          regex: regex,
          isCorrect: (result === true && probe >= number) || (result === false && probe < number)
        };
        out[number][probe] = item;

        if(!item.isCorrect){
          errors.push(item);
        }
      }
    }

    console.log(errors);
  };


}());
