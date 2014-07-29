/**
 * Created by sabir on 17.06.14.
 */

PatientTools = function(){
    var self = this;
    this.currentN = 0;
    this.videosNumber = 0;
    this.videosList=[];
    this.query = undefined;
    this.currentAcademicN = 0;
    this.academicList = [];

    this.init = function(){
        self.initParse();
        self.initButtons();
        $('#searchButton').bind('click', function(){
            self.loadVideosList();
        });
        var q = gup('q');
        if (q!=undefined){
            $('#searchInput').val(q);
        }
        //self.loadAcademic();
    }

    this.initParse = function(){
        var applicationId = "YgdiEB0yZ2nz4EPlfH7ayPhRMLweG3G6JSTg7kO3";
        var javaScriptKey = "Z5OmGYK86M6rSw3klWDa2gsjGTOCZXzkFK86pBH5";
        Parse.initialize(applicationId, javaScriptKey);
    }


    this.initButtons = function(){
        $('#uploadToParseButton').bind('click', function(){
            var list = self.videosList.map(function(item){return item.youtubeId});
            self.uploadToParse(list);
        });
        $('#sButton').bind('click', function(){
            var q = $('#sInput').val().trim();
            Parse.Cloud.run('search', {
                query: q
            }).then(function(data){
                console.log(data);
            });
        });
    }

    this.loadVideosList = function(){
        var q = $('#searchInput').val().trim();
        self.query = q;
        if (q == ''){
            alert('query is empty');
            return;
        }
        NProgress.configure({ ease: 'ease', speed: 2000 });
        NProgress.start();
        NProgress.set(1.0);
        $.ajax({
            url: 'http://www.englishpatient.ru/tools/search2.php?n=1&q=' + q,
            success: function(data){
                var list = JSON.parse(data);
                self.videosList = list;
                console.log(list);
                self.currentN = 0;
                self.videosNumber = list.length;
                NProgress.done();
                NProgress.configure({ speed: 200 });
//                self.loadCaptions(function(){
//                    self.afterLoadingCallback();
//                });
                var l = list.map(function(item){return item.youtubeId});
                //self.uploadToParse(l);
                self.createListHtml();
            }
        });
    }

    this.loadCaptions = function(callback){
        var list = self.videosList;
        for (var i in list){
            self.loadCaptionForOneVideo(list[i].youtubeId, callback);
        }
    }

    this.loadAcademic = function(){
        $.ajax({
            url: 'json/academic.json',
            success: function(data){
                self.academicList = data;
                setInterval(function(){
                    var w = self.academicList[self.currentAcademicN];
                    Parse.Cloud.run('fillWord',{
                        word: w
                    });
                    $('#currentWord').html(w + ' (' + self.currentAcademicN + ' / ' + self.academicList.length + ')');
                    self.currentAcademicN++;
                }, 5000);
            }
        });
    }

    this.extractStopWordsFromSubtitles = function(titles){
        if (titles == undefined){
            return [];
        }
        var o = {};
        var res = [];
        for (var i in titles){
            var text = titles[i].text;
            var words = text.split(/\b/);
            words = words.map(function(item){return  item.toLowerCase()});
            var stopWords = ["a", "amp", "xml", "utf", "doesn", "didn", "gt", "ll", "ve", "lt", "re", "ii", "don", "mr", "mrs", "hasn", "b", "c", "d", "e", "f", "g", "h", "i", "j", "k", "l", "m", "n", "o", "p", "q", "r", "s", "t", "u", "v", "w", "x", "y", "z", "able","about","across","after","all","almost","also","am","among","an","and","any","are","as","at","be","because","been","but","by","can","cannot","could","dear","did","do","does","either","else","ever","every","for","from","get","got","had","has","have","he","her","hers","him","his","how","however","i","if","in","into","is","it","its","just","least","let","like","likely","may","me","might","most","must","my","neither","no","nor","not","of","off","often","on","only","or","other","our","own","rather","said","say","says","she","should","since","so","some","than","that","the","their","them","then","there","these","they","this","tis","to","too","twas","us","wants","was","we","were","what","when","where","which","while","who","whom","why","will","with","would","yet","you","your","ain't","aren't","can't","could've","couldn't","didn't","doesn't","don't","hasn't","he'd","he'll","he's","how'd","how'll","how's","i'd","i'll","i'm","i've","isn't","it's","might've","mightn't","must've","mustn't","shan't","she'd","she'll","she's","should've","shouldn't","that'll","that's","there's","they'd","they'll","they're","they've","wasn't","we'd","we'll","we're","weren't","what'd","what's","when'd","when'll","when's","where'd","where'll","where's","who'd","who'll","who's","why'd","why'll","why's","won't","would've","wouldn't","you'd","you'll","you're","you've"];
            words = _.filter(words, function(w) { return w.match(/^\w+$/) && ! _.contains(stopWords, w) && ! w.match(/\d+/g); });
            _.each(words, function(w){o[w] = w});
            //console.log(words);
        }
        _.each(o, function(w){res.push(w)});
        //console.log(res);
        return res;
    }

    this.loadCaptionForOneVideo = function(youtubeId, callback){
        $.ajax({
            url: 'http://www.englishpatient.ru/tools/subtitles.php?v=' + youtubeId,
            success: function(data){
                data = JSON.parse(data);
                for (var i in self.videosList){
                    if (self.videosList[i].youtubeId == data.youtubeId){
                        self.videosList[i].subtitles = data.subtitles;
                        self.videosList[i].words = self.extractStopWordsFromSubtitles(data.subtitles);
                        break;
                    }
                }
                self.currentN++;
                NProgress.set(1.0*self.currentN / self.videosList.length);
                console.log(self.currentN);
                if (self.currentN == self.videosList.length){
                    callback();
                    NProgress.done();
                }
            },
            error: function(){
                self.currentN++;
                console.log(self.currentN);
                NProgress.set(1.0*self.currentN / self.videosList.length);
                if (self.currentN == self.videosList.length){
                    callback();
                    NProgress.done();
                }
            }
        });
    }

    this.afterLoadingCallback = function(){
        var list2 = [];
        var list = self.videosList;
        for (var i in list){
            if (list[i].subtitles != undefined){
                list2.push(list[i]);
            }
        }
        self.videosList = list2;
        self.createListHtml();
        //console.log(self.videosList);
        //self.filterSubtitles();
    }

    this.createListHtml = function(){
        var s = '';
        var list = self.videosList;
        for (var i in list){
            var item = list[i];
            s+='<li>';
            s+='<span style="background-image: url(\'' + item.thumbNail +'\')" class="resultImage"></span>';
            s+='<span class="resultContent">' + item.title +'</span>';
            s+='</li>';
        }
        $('#resultsList').html(s);
        $('#resultsNumber').text(list.length);
    }

    this.filterSubtitles = function(){
        var q = self.query;
        for (var i in self.videosList){
            self.videosList[i].filteredSubtitles = [];
            console.log('----------------------------------');
            for (var j in self.videosList[i].subtitles){
                var t = self.videosList[i].subtitles[j].text;
                if (hasWord(t, q) == true){
                    self.videosList[i].filteredSubtitles.push(self.videosList[i].subtitles[j]);
                }
            }
        }
    }

    this.drawList = function(){
        var list = self.videosList;
        var s = '';
        for (var i in list){
            s+=self.generateListItemHtml(list[i], i);
        }
        $('#resultsList').html(s);
    }

    this.generateListItemHtml = function(item, num){
        if (item == undefined){
            return;
        }
        var s = '<li data-num="'+ num +'" data-start="' + item.start +'" data-dur="'+ item.diration +'" data-youtubeId="' + item.youtubeId +'" > <span style="background-image: url(\'http://img.youtube.com/vi/' + item.youtubeId +'/2.jpg\')" class="resultImage"></span><span class="resultContent">... ' + item.text +' ...</span></li>';
        return s;
    }

    this.uploadToParse = function(list){
        Parse.Cloud.run('processManyVideos', {
            list: list
        });
    }

}


function gup(name){
    name = name.replace(/[\[]/,"\\\[").replace(/[\]]/,"\\\]");
    var regexS = "[\\?&]"+name+"=([^&#]*)";
    var regex = new RegExp( regexS );
    var results = regex.exec( window.location.href );
    if( results == null )    return "";
    else    return results[1];
}

function hasWord(text, word){

    if (text == undefined || word == undefined){
        return false;
    }
    text = text.toLowerCase();
    text = text.replace(/\s+/g,' ').trim();
    word = word.toLowerCase();

    //console.log(text);

    //return (text.indexOf(word) >= 0);

    var strRe = "(.*)\\b" + word + "\\b(.*)";
    var re = new RegExp(strRe, "i");
    return re.test(text);

}