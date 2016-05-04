/*
 * Disclaimer
 * This script should be used for learning purposes only.
 * By downloading and running this script you take every responsibility for wrong or illegal uses of it.
 * Please read Facebook Terms of Service for more information: https://www.facebook.com/terms
 */

/*
 * MIT License

 * Copyright (c) 2016 NerdsUnity

 * Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation
 * files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify,
 * merge, publish, distribute, sublicense, and/or sell copies of the Software,
 * and to permit persons to whom the Software is furnished to do so,
 * subject to the following conditions:

 * The above copyright notice and this permission notice shall be included in all copies or substantial portions of the
 * Software.

 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED,
 * INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR
 * PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE
 * FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE,
 * ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
 */

/*
 * This function wraps WebPage.evaluate, and offers the possibility to pass
 * parameters into the webpage function. The PhantomJS issue is here:
 *
 *   http://code.google.com/p/phantomjs/issues/detail?id=132
 *
 * This is from comment #43.
 */
function evaluate(page, func) {
    var args = [].slice.call(arguments, 2);
    var fn = "function() { return (" + func.toString() + ").apply(this, " + JSON.stringify(args) + ");}";
    return page.evaluate(fn);
}

var args = require('system').args;
var page = require('webpage').create();

var data = {
    email : args[1],
    password:args[2],
    emailToScrape: args[3]
};

page.open("http://www.facebook.com/login.php", function(status) {
    if (status === "success") {
        page.onConsoleMessage = function(msg, lineNum, sourceId) {
            console.log('CONSOLE: ' + msg);
        };

        page.onError = function(msg, lineNum, sourceId) {
            console.log('ERROR: ' + msg);
        };

        evaluate(page, function(data) {
            document.getElementById("email").value = data.email;
            document.getElementById("pass").value = data.password;
            document.getElementById("loginbutton").click();
            console.log('Just entered FB info');
            page.render("facebook_login.png");
        }, data);

        setTimeout(function() {
            page.open(encodeURI("https://www.facebook.com/search/top/?q="+data.emailToScrape), function(status) {
                setTimeout(function() {
                    page.includeJs("http://ajax.googleapis.com/ajax/libs/jquery/1.6.1/jquery.min.js", function() {
                        evaluate(page, function(data) {
                            console.log('Now searching for email'+data.emailToScrape);

                            var myfriend = $(document).find("#contentArea .FriendRequestAdd");

                            if(myfriend.length > 0){
                                myfriend.trigger("click");
                                console.log('Email: '+data.emailToScrape+" has been added as friend");
                            }else{
                                console.log('Email: '+data.emailToScrape+" is not on Facebook or an error occured");
                            }
                        }, data);
                        page.render("facebook_addfriend.png");
                    });
                }, 1000);

            });
        }, 3000);
    }
});
