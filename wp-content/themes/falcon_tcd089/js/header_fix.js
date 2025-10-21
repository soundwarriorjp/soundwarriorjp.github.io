jQuery(document).ready(function($){

  var header_message_height = 0;
  if($('#header_message').length){
    header_message_height = $('#header_message').innerHeight();
  }

  if($(window).scrollTop() &gt; header_message_height) {
    $("body").addClass("header_fix");
    $("body").addClass("header_fix_mobile");
    $("#header").addClass("active");
  }

  $(window).scroll(function () {
    if($(this).scrollTop() &gt; header_message_height) {
      $("body").addClass("header_fix");
      $("body").addClass("header_fix_mobile");
      $("#header").addClass("active");
    } else {
      $("body").removeClass("header_fix");
      $("body").removeClass("header_fix_mobile");
      if( !$('body').hasClass('header_on_hover') ){
         $("#header").removeClass("active");
      }
    };
  });


});