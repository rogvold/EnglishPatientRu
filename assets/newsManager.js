NewsManager = function(){
    var self = this;
    this.newsHtml = undefined;
    this.announcementHtml = undefined;
    
    this.initParse = function(){
        var applicationId = "kQhSiMvBQeJORpAexyc18sBg00oBuVOJnEyRbLhI";
        var javaScriptKey = "vRQZOqm2bXeeaCu0i17RX8BmaJdKKMCsxL0QPXW3";
        Parse.initialize(applicationId, javaScriptKey);
    }
    
    this.loadContent = function(){
        var callback = function(){
            $('#newsBlock').html(self.newsHtml);
            $('#announcementBlock').html(self.announcementHtml);
            $('p').removeAttr('contenteditable');
        }
        self.loadNews(callback);
        $('#submitButton').click(function(){
            self.saveContact();
        });
    }
    
    this.prepareEditingPage= function(){
        var callback = function(){
            $('#newsBlock').html(self.newsHtml);
             $('#newsSaveButton').click(function(){
                //var html = $('#jquery-notebook-content-1').val();
                var html = $('#newsBlock').html();
                var aHtml = $('#announcementBlock').html();
                console.log(html);
                self.saveNewsHtml(html, function(){
                    self.saveAnnouncementHtml(aHtml, function(){alert('saved');});
                });
            });
            
            $('#announcementBlock').html(self.announcementHtml);
           
        }
        self.loadNews(callback);
    }
    
    this.loadNews = function(callback){
        var NewsClass = Parse.Object.extend("NewsClass");
        var query = new Parse.Query(NewsClass);
        query.limit(1);
        query.find(function(results){
            self.newsHtml = results[0].get("newsHtml");
            self.announcementHtml = results[0].get("announcementHtml");
            if (isFunction(callback)){
                callback();
            }
        });
    }
    
    this.saveNewsHtml = function(newsHtml, callback){
        var NewsClass = Parse.Object.extend("NewsClass");
        var query = new Parse.Query(NewsClass);
        query.find(function(results){
        results[0].set('newsHtml', newsHtml);
        results[0].save().then(function(obj){if (isFunction(callback)){callback();} });
        });
    }
    
    this.saveAnnouncementHtml = function(announcementHtml, callback){
        var NewsClass = Parse.Object.extend("NewsClass");
        var query = new Parse.Query(NewsClass);
        query.find(function(results){
        results[0].set('announcementHtml', announcementHtml);
        results[0].save().then(function(obj){if (isFunction(callback)){callback();} });
        });
    }
    
    this.saveContact = function(){
        var ContactForm = Parse.Object.extend("ContactForm");
        var form = new ContactForm();
        
        var email = $('#email').val().trim();
        var name = $('#name').val().trim();
        var phone = $('#phone').val().trim();
        
        if (name == '' || name == undefined){
            $('#formErrorBlock').show();
            $('#formErrorBlock').text('Вы не ввели имя.');
            return;
        }
        
        if ((validateEmail(email) == false) && (phone == '' || phone == undefined)){
            $('#formErrorBlock').show();
            $('#formErrorBlock').text('Не корректно введены данные. Попробуйте еще раз.');
            alert('Не корректно введены данные. Попробуйте еще раз.');
            return;
        }
        
        form.set('email', email);
        form.set('name', name);
        form.set('phone', phone);
        
        form.save().then(function(){ 
            $('#emailAndPhoneBlock').html('<h2>Спасибо!</h2>');
            $('#submitButton').hide();
            $('#formErrorBlock').hide();
        });
    }

}

function validateEmail(email) {
                if (email == undefined || email == ''){
                    return false;
                }
                var re = /^(([^<>()[\]\\.,;:\s@\"]+(\.[^<>()[\]\\.,;:\s@\"]+)*)|(\".+\"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
                return re.test(email);
}

function isFunction(f){
   return (typeof(f) == "function");
}



