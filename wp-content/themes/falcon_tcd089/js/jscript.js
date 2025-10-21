jQuery(document).ready(function($){

  var $window = $(window);

  // inner link ---------------------------------
  $(':is(.post_content, .p-toc) a[href*=#]').click(function() {
    var speed = 1000,
        href = $(this).prop("href"),
        hrefPageUrl = href.split("#")[0],
        currentUrl = location.href,
        currentUrl = currentUrl.split("#")[0];
    if(hrefPageUrl == currentUrl){
      href = href.split("#");
      href = href.pop();
      href = "#" + href;
      var target = $(href == "#" || href == "" ? 'html' : href);
      if( target.length ){
        var position = target.offset().top - 30,
            body = 'html',
            userAgent = window.navigator.userAgent.toLowerCase(),
            header_height = $('#header').innerHeight();
        $(body).animate({ scrollTop: position - header_height }, speed, 'easeOutExpo');
      }
      return false;
    }
  });

  // gallery
  $('.cb_gallery_row').each(function(){
    if( $(this).find('.content_type2').length ) {
      $(this).addClass('has_desc');
    }
  });

  $("a").bind("focus",function(){if(this.blur)this.blur();});
  $("a.target_blank").attr("target","_blank");


  // mega menu -------------------------------------------------

  // mega menu post list animation
  $(document).on({mouseenter : function(){
    $(this).parent().siblings().removeClass('active')
    $(this).parent().addClass('active');
    var $content_id = "." + $(this).attr('data-cat-id');
    $(".megamenu_blog_list .post_list").removeClass('active');
    $($content_id).addClass('active');
    return false;
  }}, '.megamenu_blog_list .category_list a');

  // mega menu basic animation
  $('[data-megamenu]').each(function() {

    var mega_menu_button = $(this);
    var sub_menu_wrap =  "#" + $(this).data("megamenu");
    var hide_sub_menu_timer;
    var hide_sub_menu_interval = function() {
      if (hide_sub_menu_timer) {
        clearInterval(hide_sub_menu_timer);
        hide_sub_menu_timer = null;
      }
      hide_sub_menu_timer = setInterval(function() {
        if (!$(mega_menu_button).is(':hover') &amp;&amp; !$(sub_menu_wrap).is(':hover')) {
          $(sub_menu_wrap).stop().css('z-index','100').removeClass('active_mega_menu');
          clearInterval(hide_sub_menu_timer);
          hide_sub_menu_timer = null;
        }
      }, 20);
    };

    mega_menu_button.hover(
     function(){
       if (hide_sub_menu_timer) {
         clearInterval(hide_sub_menu_timer);
         hide_sub_menu_timer = null;
       }
       if ($('html').hasClass('pc')) {
         $(this).parent().addClass('active_megamenu_button');
         $(this).parent().find("ul").addClass('megamenu_child_menu');
         $(sub_menu_wrap).stop().css('z-index','200').addClass('active_mega_menu');
         if( $('.megamenu_slider').length ){
           $('.megamenu_slider').slick('setPosition');
         };
       }
     },
     function(){
       if ($('html').hasClass('pc')) {
         $(this).parent().removeClass('active_megamenu_button');
         $(this).parent().find("ul").removeClass('megamenu_child_menu');
         hide_sub_menu_interval();
       }
     }
    );

    $(sub_menu_wrap).hover(
      function(){
        $(mega_menu_button).parent().addClass('active_megamenu_button');
      },
      function(){
        $(mega_menu_button).parent().removeClass('active_megamenu_button');
      }
    );


    $('#header').on('mouseout', sub_menu_wrap, function(){
     if ($('html').hasClass('pc')) {
       hide_sub_menu_interval();
     }
    });

  }); // end mega menu


  //return top button for PC
  $('#return_top2 a').click(function() {
    var myHref= $(this).attr("href");
    var myPos = $(myHref).offset().top;
    $("html,body").animate({scrollTop : myPos}, 1000, 'easeOutExpo');
    return false;
  });


  //return top button for mobile
  var return_top_button = $('#return_top');
  $('a',return_top_button).click(function() {
    var myHref= $(this).attr("href");
    var myPos = $(myHref).offset().top;
    $("html,body").animate({scrollTop : myPos}, 1000, 'easeOutExpo');
    return false;
  });
  return_top_button.removeClass('active');
  $window.scroll(function () {
    if ($(this).scrollTop() &gt; 100) {
      return_top_button.addClass('active');
    } else {
      return_top_button.removeClass('active');
    }
  });


  //fixed footer content
  var fixedFooter = $('#fixed_footer_content');
  fixedFooter.removeClass('active');
  $window.scroll(function () {
    if ($(this).scrollTop() &gt; 330) {
      fixedFooter.addClass('active');
    } else {
      fixedFooter.removeClass('active');
    }
  });
  $('#fixed_footer_content .close').click(function() {
    $("#fixed_footer_content").hide();
    return false;
  });


  // comment button
  $("#comment_tab li").click(function() {
    $("#comment_tab li").removeClass('active');
    $(this).addClass("active");
    $(".tab_contents").hide();
    var selected_tab = $(this).find("a").attr("href");
    $(selected_tab).fadeIn();
    return false;
  });


  //custom drop menu widget
  $(".tcdw_custom_drop_menu li:has(ul)").addClass('parent_menu');
  $(".tcdw_custom_drop_menu li").hover(function(){
     $("&gt;ul:not(:animated)",this).slideDown("fast");
     $(this).addClass("active");
  }, function(){
     $("&gt;ul",this).slideUp("fast");
     $(this).removeClass("active");
  });


  // design select box widget
  $(".design_select_box select").on("click" , function() {
    $(this).closest('.design_select_box').toggleClass("open");
  });
  $(document).mouseup(function (e){
    var container = $(".design_select_box");
    if (container.has(e.target).length === 0) {
      container.removeClass("open");
    }
  });


  //tab post list widget
  $('.widget_tab_post_list_button').on('click', '.tab1', function(){
    $(this).siblings().removeClass('active');
    $(this).addClass('active');
    $(this).closest('.tab_post_list_widget').find('.widget_tab_post_list1').addClass('active');
    $(this).closest('.tab_post_list_widget').find('.widget_tab_post_list2').removeClass('active');
    return false;
  });
  $('.widget_tab_post_list_button').on('click', '.tab2', function(){
    $(this).siblings().removeClass('active');
    $(this).addClass('active');
    $(this).closest('.tab_post_list_widget').find('.widget_tab_post_list2').addClass('active');
    $(this).closest('.tab_post_list_widget').find('.widget_tab_post_list1').removeClass('active');
    return false;
  });


  //archive list widget
  if ($('.p-dropdown').length) {
    $('.p-dropdown__title').click(function() {
      $(this).toggleClass('is-active');
      $('+ .p-dropdown__list:not(:animated)', this).slideToggle();
    });
  }


  //category widget
  $(".tcd_category_list li:has(ul)").addClass('parent_menu');
  $(".tcd_category_list li.parent_menu &gt; a").parent().prepend("<span class="child_menu_button"></span>");
  $(".tcd_category_list li .child_menu_button").on('click',function() {
     if($(this).parent().hasClass("open")) {
       $(this).parent().removeClass("active");
       $(this).parent().removeClass("open");
       $(this).parent().find('&gt;ul:not(:animated)').slideUp("fast");
       return false;
     } else {
       $(this).parent().addClass("active");
       $(this).parent().addClass("open");
       $(this).parent().find('&gt;ul:not(:animated)').slideDown("fast");
       return false;
     };
  });


  //search widget
  $('.widget_search #searchsubmit').wrap('<div class="submit_button"></div>');
  $('.google_search #searchsubmit').wrap('<div class="submit_button"></div>');


  //calendar widget
  $('.wp-calendar-table td').each(function () {
    if ( $(this).children().length == 0 ) {
      $(this).addClass('no_link');
      $(this).wrapInner('<span></span>');
    } else {
      $(this).addClass('has_link');
    }
  });

  // テキストウィジェットとHTMLウィジェットにエディターのクラスを追加する
  $('.widget_text .textwidget').addClass('post_content');

  // アーカイブとカテゴリーのセレクトボックスにselect_wrapのクラスを追加する
  $('.widget_archive select').wrap('<div class="select_wrap"></div>');
  $('.widget_categories form').wrap('<div class="select_wrap"></div>');

  // header search
  $("#header_search_button").on('click',function() {
    if($(this).parent().hasClass("active")) {
      $(this).parent().removeClass("active");
      return false;
    } else {
      $(this).parent().addClass("active");
      $('#header_search_input').focus();
      return false;
    }
  });

  // active header
  if (!$('body').hasClass('active_header')) {
    $("#global_menu li.menu-item-has-children").hover(function(){
      $('#header').addClass('active_mega_menu');
    }, function(){
      $('#header').removeClass('active_mega_menu');
    });
  };
  $("#header").hover(function(){
    $('body').addClass('header_on_hover');
    $('#header').addClass('active');
  }, function(){
    $('body').removeClass('header_on_hover');
    if (!$('body').hasClass('header_fix')) {
      $('#header').removeClass('active');
    }
  });

  // global menu
  $("#global_menu li:not(.megamenu_parent)").hover(function(){
    $("&gt;ul:not(:animated)",this).slideDown("fast");
    $(this).addClass("active");
  }, function(){
    $("&gt;ul",this).slideUp("fast");
    $(this).removeClass("active");
  });

  // news category
  $(document).on({
    'mouseenter':function(){
      var $a = $(this).closest('a');
      $a.attr('data-href', $a.attr('href'));
      if ($(this).attr('data-href')) {
        $a.attr('href', $(this).attr('data-href'));
      }
    },
    'mouseleave':function () {
      var $a = $(this).closest('a');
      $a.attr('href', $a.attr('data-href'));
    }
  },'a li[data-href]');


// responsive ------------------------------------------------------------------------
var mql = window.matchMedia('screen and (min-width: 1201px)');
function checkBreakPoint(mql) {

 if(mql.matches){ //PC

   $("html").removeClass("mobile");
   $("html").addClass("pc");

   $('a.megamenu_button').parent().addClass('megamenu_parent');

 } else { //smart phone

   $("html").removeClass("pc");
   $("html").addClass("mobile");

   // perfect scroll
   if ($('#drawer_menu').length) {
     if(! $(body).hasClass('mobile_device') ) {
       new SimpleBar($('#drawer_menu')[0]);
     };
   };
/*
   if ($('#showroom_sort_button').length) {
     if(! $(body).hasClass('mobile_device') ) {
       new SimpleBar($('#showroom_sort_button')[0]);
     }
   }
*/

   // drawer menu
   $("#mobile_menu .child_menu_button").remove();
   $('#mobile_menu li &gt; ul').parent().prepend("<span class="child_menu_button"><span class="icon"></span></span>");
   $("#mobile_menu .child_menu_button").on('click',function() {
     if($(this).parent().hasClass("open")) {
       $(this).parent().removeClass("open");
       $(this).parent().find('&gt;ul:not(:animated)').slideUp("fast");
       return false;
     } else {
       $(this).parent().addClass("open");
       $(this).parent().find('&gt;ul:not(:animated)').slideDown("fast");
       return false;
     };
   });

   // drawer menu button
   var menu_button = $('#global_menu_button');
   menu_button.off();
   menu_button.removeAttr('style');
   menu_button.toggleClass("active",false);

  // open drawer menu
   menu_button.on('click', function(e) {

      e.preventDefault();
      e.stopPropagation();
      $('html').toggleClass('open_menu');

      $('#container').one('click', function(e){
        if($('html').hasClass('open_menu')){
          $('html').removeClass('open_menu');
          return false;
        };
      });

   });

  // animation scroll link
  $('#mobile_menu a[href^="#"]').click(function() {
    var myHref= $(this).attr("href");
    if($("html").hasClass("mobile") &amp;&amp; $("body").hasClass("use_mobile_header_fix")) {
      var myPos = $(myHref).offset().top - 60;
    } else if($("html").hasClass("mobile")) {
      var myPos = $(myHref).offset().top;
    } else if($("html").hasClass("pc") &amp;&amp; $("body").hasClass("use_header_fix")) {
      if($("html").hasClass("pc") &amp;&amp; $("body").hasClass("menu_type2 hide_header_logo hide_global_menu")) {
        var myPos = $(myHref).offset().top;
      } else {
        var myPos = $(myHref).offset().top - 80;
      }
    } else {
      var myPos = $(myHref).offset().top;
    }
    $("html,body").animate({scrollTop : myPos}, 1000, 'easeOutExpo');
    if($('html').hasClass('open_menu')){
      $('html').removeClass('open_menu');
      return false;
    };
    return false;
  });

 };
};
mql.addListener(checkBreakPoint);
checkBreakPoint(mql);


});