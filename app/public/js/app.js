// CodeMirror
var editor;

// CodeMirror options
var cm_opts = {
  lineNumbers: true,
  tabSize: 2,
  theme: 'eclipse',
  matchBrackets: true
};

$(function(){
  editor = CodeMirror.fromTextArea($("#code")[0], cm_opts);

  // empty code check
  editor.on("change",function(ed,obj){
    var code = ed.getValue()
    if(code===''){
      $("button#test-flight").addClass("disabled").attr('disabled',true);
      
      if($("button#save-btn")[0]){
        $("button#save-btn").addClass("disabled").attr('disabled',true);
      }

      if($("button#update-btn")[0]){
        $("button#update-btn").empty().append("Delete").addClass('red');;
      }

    }else{
      $("button#test-flight").removeClass("disabled").attr('disabled',false).removeAttr('disabled');
      if($("button#save-btn")[0]){
        $("button#save-btn").removeClass("disabled").attr('disabled',false).removeAttr('disabled');
      }
      if($("button#update-btn")[0]){
        $("button#update-btn").empty().append("Update").removeClass('red');
      }
    }
  });

  // save action
  $("button#save-btn").on('click', function(e){
    var cm = $('div.CodeMirror');
    
    e.stopPropagation();
    $("form#code-form").attr('action','/c');
  });

  // update action
  $("button#update-btn").on('click', function(e){
    var cm = $('div.CodeMirror');
    
    e.preventDefault();
    editor.setOption("readOnly", "nocursor");
    editor.setOption("matchBrackets",false);
    cm.css({opacity: 0.5});
    $("div#info").empty().append("<p class='big'>Saving...</p>");
    $("button#test-flight").addClass("disabled").attr('disabled',true);
    $("button#update-btn").addClass("disabled").attr('disabled',true);

    $.ajax({
      type: "POST",
      url: "/xhr/update",
      data: {id: $("input#code-id").val(), name: $("input#fnname").val(), code: editor.getValue()},
      dataType: "json"
    }).done(function(res){
      if(res.message==="delete"){
        var id = res.id;
        window.location.href = location.protocol+"//"+location.host+"/all";
      }else{
        var now = moment(new Date()).format('YYYY-MM-DD HH:mm:ss');
        var res = $.extend({},res,{date: now});
        $("div#info").empty().append("<p class='big green'>id: "+res.id+" saved at "+res.date+"</p>");
      }
    }).fail(function(res){
      $("div#info").empty().append("<p class='big red'>Cannot Save</p>");
    }).always(function(){
      editor.setOption("readOnly", false);
      editor.setOption("matchBrackets",true);
      cm.css({opacity: 1.0});
      $("button#test-flight").removeClass("disabled").attr('disabled',false).removeAttr('disabled');
      $("button#update-btn").removeClass("disabled").attr('disabled',false).removeAttr('disabled');
    });
  });

});