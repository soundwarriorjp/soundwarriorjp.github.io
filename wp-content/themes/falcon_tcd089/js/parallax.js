/*
パララックス化する要素に下記属性を追加してください。
data-parallax-image="PC用画像URL" ※必須 これをjsセレクタとして要素検索 空ならモバイル用画像を使用
data-parallax-mobile-image="モバイル用画像URL" ※オプション 空ならPC用画像を使用
data-parallax-speed="-1～0～1" ※オプション パララックススクロール係数 0でパララックス効果なし。未指定時はデフォルト設定defaultSpeedを使用します。
data-parallax-blur="0～" ※オプション 背景画像全体のぼかしサイズ 0でぼかしなし、未設定時はデフォルト設定defaultBlurを使用します。全体ぼかしを使用する場合はcssでposition: absoluteが指定されている必要があります。

パララックス要素上のオーバーレイ要素にぼかし背景を入れる場合はぼかし要素に下記属性を追加してください。
data-parallax-overlay-blur="1～" ※必須 パララックス要素の子要素もしくはパララックス要素のposition:relative要素の子要素にオーバーレイ要素が存在し、その子要素に指定する必要があります。この要素のposition系cssは基本的に不要です。

オーバーレイぼかしのサンプル：
<div class="parallax" data-parallax-image="01.jpg" style="position: relative; height: 600px;">
<div class="parallax-overlay" style="position: absolute; bottom: 50px; left: 50px; right: 50px; top: 50px; z-index: 2;">
<div class="parallax-overlay-contents">text...</div>
<div class="parallax-overlay-bg" data-parallax-overlay-blur="5"></div>
</div>
</div>
<div class="parallax" style="position: relative; height: 600px;">
<div class="parallax-overlay" style="position: absolute; bottom: 50px; left: 50px; right: 50px; top: 50px; z-index: 2;">
<div class="parallax-overlay-contents">text...</div>
<div class="parallax-overlay-bg" data-parallax-overlay-blur="5"></div>
</div>
<div class="parallax-image" data-parallax-image="01.jpg" style="position: absolute; bottom: 0; left: 0; right: 0; top: 0; z-index: 1;"></div>
</div>
*/
jQuery(function($){

	var $elems = $('[data-parallax-image]');
	if (!$elems.length) return;

	// モバイル画像に切り替えるブレイクポイント
	var mobileBreakpoint = 750;

	// デフォルトのパララックススクロール係数
	// data-parallax-speedで上書きされます
	// この係数を-1～0～2の間で変えることで視差調整が可能。
	// 0 : 通常表示（パララックス処理されません）
	// 0～1 : 一般的なパララックス表示
	// -1～0 : 逆方向パララックス表示
	var defaultSpeed = -0.7;

	// デフォルトの全体ぼかし
	// data-parallax-blurで上書きされます
	var defaultBlur = 0;

	// 変数
	var $window = $(window);
	var $body = $('body');
	var ua = window.navigator.userAgent.toLowerCase();
	var elemSettings = [];
	var images = [];
	var mobileImages = [];
	var resizeTimer = null;
	var winWidth = window.innerWidth || $body.width();
	var winHeight = window.innerHeight || $window.innerHeight();

	// IE判別
	var isIE = (ua.indexOf('msie') &gt; -1 || ua.indexOf('trident') &gt; -1);

	// IE・Edgeの場合はsvgでぼかし
	// Edgeはfilter: blur(Npx)だとフチ透過対策が効かないため。
	// 2019/08時点 Chromium版EdgeはUAがEdgeではなくEdgのため対象外で問題なし。
	var useSvgBlur = (isIE || ua.indexOf('edge') &gt; -1);

	// スマホ判別
	var isSmartPhone = (ua.indexOf('iphone') &gt; -1 || ua.indexOf('ipod') &gt; -1 || ua.indexOf('android') &gt; -1 &amp;&amp; ua.indexOf('mobile') &gt; -1);

	// モバイル判別
	var isMobile = (isSmartPhone || ua.indexOf('ipad') &gt; -1 || ua.indexOf('android') &gt; -1);

	// ブレイクポイントによるモバイル判別
	var checkParallaxMobile = function() {
		var mql = window.matchMedia('(max-width: ' + mobileBreakpoint + 'px)');
		return mql.matches;
	};
	var isParallaxMobile = checkParallaxMobile();

	// SVGぼかし用SVG生成
	var parallaxCreateSvg = function(src, blur) {
		var svgid = Math.random().toString(36).substr(2, 9);
		var $svg = $('<svg class="parallax-blur" height="100%" id="svg-' + svgid + '" preserveaspectratio="none" version="1.1" viewbox="0 0 100% 100%" width="100%" xmlns="http://www.w3.org/2000/svg"><filter id="blur-' + svgid + '"><fegaussianblur in="SourceGraphic" stddeviation="' + blur + '"></fegaussianblur></filter><image externalresourcesrequired="true" height="100%" preserveaspectratio="none" style="filter:url(#blur-' + svgid + ')" width="100%" x="0" xlink:href="' + src + '" y="0"/></svg>');
		return $svg;
	};

	// パララックススクロールでのオフセット処理 ratioは0～1
	var parallaxBgScrollSetOffset = function(i, offsetYRatio) {
		var $elem = $elems.eq(i);
		var offsetYpixel, boxHeight;

		// 全体ぼかしあり
		if (elemSettings[i].blur) {
			boxHeight = $elem.offsetParent().innerHeight();

			// パララックススクロール係数を反映して天地中央からのオフセットピクセル計算
			offsetYpixel = (0.5 - offsetYRatio) * boxHeight * elemSettings[i].speed * -1;

			// 画像オフセット反映して丸める ※天地中央調整は画像オフセットに含まれる
			offsetYpixel = Math.round((offsetYpixel - elemSettings[i].imageOffsetY) * 10) / 10;

			// css反映 translate3dだとchromeで表示領域にぼかしがかかる
			$elem.css('transform', 'translateY(' + offsetYpixel + 'px)');

			// オーバーレイぼかしありの場合
			if (elemSettings[i].$overlayBlurInner) {
				elemSettings[i].$overlayBlurInner.css('transform', 'translateY(' + offsetYpixel + 'px)');
			}

		// 全体ぼかしなし
		} else {
			boxHeight = $elem.innerHeight();

			// パララックススクロール係数を反映して天地中央からのオフセットピクセル計算
			offsetYpixel = (0.5 - offsetYRatio) * boxHeight * elemSettings[i].speed * -1;

			// 画像オフセット反映して丸める ※天地中央調整は画像オフセットに含まれる
			offsetYpixel = Math.round((offsetYpixel - elemSettings[i].imageOffsetY) * 10) / 10;

			// css反映
			$elem.css('backgroundPositionY', offsetYpixel + 'px');

			// オーバーレイぼかしありの場合
			if (elemSettings[i].$overlayBlurInner) {
				// translate3dだとchromeで表示領域にぼかしがかかる
				elemSettings[i].$overlayBlurInner.css('transform', 'translateY(' + offsetYpixel + 'px)');
			}
		}
	};

	// パララックススクロール処理
	var parallaxBgScroll = function() {
		var winScrollTop = $window.scrollTop();

		$elems.each(function(i){
			// パララックスなしもしくはサイズ計算が終わっていない場合は終了
			if (elemSettings[i].speed === 0 || elemSettings[i].imageOffsetY === undefined) return;

			// 全体ぼかしあり
			if (elemSettings[i].blur) {
				var $elem = $(this);
				var $box = $elem.offsetParent();
				var boxOffsetTop = Math.ceil($box.offset().top);
				var boxHeight = $box.innerHeight();
				var offsetY, offsetYRatio;

				// この領域が画面内に表示されている場合
				if ((winScrollTop + winHeight &gt; boxOffsetTop - 10) &amp;&amp; (boxOffsetTop + boxHeight &gt; winScrollTop - 10)) {
					// スクリーン内でのオフセット割合計算 0～1になる
					offsetYRatio = (winScrollTop - boxOffsetTop + winHeight) / (winHeight + boxHeight);

					// オフセット処理
					parallaxBgScrollSetOffset(i, offsetYRatio);
				}

			// 全体ぼかしなし
			} else {
				var $elem = $(this);
				var boxOffsetTop = Math.ceil($elem.offset().top);
				var boxHeight = $elem.innerHeight();
				var offsetY, offsetYRatio;

				// この領域が画面内に表示されている場合
				if ((winScrollTop + winHeight &gt; boxOffsetTop - 10) &amp;&amp; (boxOffsetTop + boxHeight &gt; winScrollTop - 10)) {
					// スクリーン内でのオフセット割合計算 0～1になる
					offsetYRatio = (winScrollTop - boxOffsetTop + winHeight) / (winHeight + boxHeight);

					// オフセット処理
					parallaxBgScrollSetOffset(i, offsetYRatio);
				}
			}
		});
	};
	$window.on('load scroll', parallaxBgScroll);

	// 背景画像サイズ計算
	var parallaxCalcBgImageSize = function(i){
		var $elem = $elems.eq(i);
		var img, $box, boxHeight, boxWidth, boxOffsetTop, backgroundImageHeight, backgroundImageWidth;

		if (isParallaxMobile &amp;&amp; mobileImages[i].img.src) {
			if (!mobileImages[i].img.complete) return;
			img = mobileImages[i].img;
		} else {
			if (!images[i].img.complete) return;
			img = images[i].img;
		}

		// 画像変更
		if (elemSettings[i].currentImageSrc !== img.src) {
			$elem.css('backgroundImage', 'url(' + img.src + ')');
			elemSettings[i].currentImageSrc = img.src;
			$elem.removeClass('parallax-initialized parallax-ready');

			// SVGぼかしあり（全体ぼかし・オーバーレイぼかし兼用）
			if (useSvgBlur) {
				for (var j = 0; j &lt; elemSettings[i].svgs.length; j++) {
					elemSettings[i].svgs[j].find('image').attr('xlink:href', img.src);
				}

			// filter:blurのオーバーレイぼかしあり
			} else if (elemSettings[i].$overlayBlurInner) {
				elemSettings[i].$overlayBlurInner.css('backgroundImage', 'url(' + img.src + ')');
			}
		} else if ($elem.hasClass('parallax-initialized')) {
			return;
		}

		// 全体ぼかしあり
		if (elemSettings[i].blur) {
			$box = $elem.offsetParent();
			boxHeight = $box.innerHeight();
			boxWidth = $box.innerWidth();

			// パララックス効果分込みで必要な画像の高さ
			var parallaxHeight = Math.ceil(boxHeight * Math.abs(elemSettings[i].speed) + boxHeight);
			elemSettings[i].parallaxHeight = parallaxHeight;

			// ぼかしのフチの透過領域込みのサイズ
			var parallaxBlurHeight = parallaxHeight + elemSettings[i].blur * 2 * 2;
			var parallaxBlurWidth = boxWidth + elemSettings[i].blur * 2 * 2;
			elemSettings[i].parallaxBlurHeight = parallaxBlurHeight;

			var parallaxRatio, imgRatio;
			parallaxRatio = boxWidth / parallaxHeight;
			imgRatio = img.width / img.height;

			// 画像の方が横長
			if (parallaxRatio &lt; imgRatio) {
				backgroundImageWidth = Math.ceil(parallaxBlurHeight / img.height * img.width);
				backgroundImageHeight = parallaxBlurHeight;
				elemSettings[i].imageOffsetX = (backgroundImageWidth - parallaxBlurWidth) / 2 + elemSettings[i].blur * 2;
				elemSettings[i].imageOffsetY = elemSettings[i].blur * 2;
			// 画像の方が縦長
			} else {
				backgroundImageHeight = Math.ceil(parallaxBlurWidth / img.width * img.height);
				backgroundImageWidth = parallaxBlurWidth;
				elemSettings[i].imageOffsetX = elemSettings[i].blur * 2;
				elemSettings[i].imageOffsetY = elemSettings[i].blur * 2;
			}

			$elem.css({
				height: backgroundImageHeight,
				width: backgroundImageWidth,
				bottom: 'auto',
				left: elemSettings[i].imageOffsetX * -1,
				right: 'auto',
				top: (backgroundImageHeight - boxHeight) / -2
			});

			// スクロール0時に画面内にある場合は天地位置調整
			boxOffsetTop = Math.ceil($box.offset().top);
			if (boxOffsetTop + boxHeight &lt; winHeight) {
				elemSettings[i].imageOffsetY += Math.ceil((winHeight / 2 - boxOffsetTop - boxHeight / 2) * elemSettings[i].speed);
			}

			elemSettings[i].backgroundImageHeight = backgroundImageHeight;

		// 全体ぼかしなし
		} else {
			$box = $elem;
			boxHeight = $box.innerHeight();
			boxWidth = $box.innerWidth();

			// パララックス効果分込みで必要な画像の高さ
			var parallaxHeight = Math.ceil(boxHeight * Math.abs(elemSettings[i].speed) + boxHeight);
			elemSettings[i].parallaxHeight = parallaxHeight;

			var parallaxRatio, imgRatio;
			parallaxRatio = boxWidth / parallaxHeight;
			imgRatio = img.width / img.height;

			// 画像の方が横長
			if (parallaxRatio &lt; imgRatio) {
				backgroundImageHeight = parallaxHeight;
				backgroundImageWidth = Math.ceil(parallaxHeight / img.height * img.width);
				$elem.css('backgroundSize', backgroundImageWidth + 'px ' + parallaxHeight + 'px');
				elemSettings[i].imageOffsetY = (backgroundImageHeight - boxHeight) / 2;
			// 画像の方が縦長
			} else {
				$elem.css('backgroundSize', 'cover');
				backgroundImageHeight = Math.ceil(boxWidth / img.width * img.height);
				backgroundImageWidth = boxWidth;
				elemSettings[i].imageOffsetY = (backgroundImageHeight - boxHeight) / 2;
			}

			// スクロール0時に画面内にある場合は天地位置調整
			boxOffsetTop = Math.ceil($elem.offset().top);
			if (boxOffsetTop + boxHeight &lt; winHeight) {
				elemSettings[i].imageOffsetY += Math.ceil((winHeight / 2 - boxOffsetTop - boxHeight / 2) * elemSettings[i].speed);
			}

			elemSettings[i].backgroundImageHeight = backgroundImageHeight;
		}

		// オーバーレイぼかしありの場合
		if (elemSettings[i].$overlayBlur) {
			var boxOffset = $box.offset();
			elemSettings[i].$overlayBlur.each(function(){
				var $this = $(this);
				var offset = $this.offset();
				var $inner = $this.find('.parallax-overlay-blur-inner');

				$inner.css({
					height: backgroundImageHeight,
					width: backgroundImageWidth,
					position: 'absolute',
					bottom: 'auto',
					right: 'auto',
					left: (backgroundImageWidth - boxWidth) / -2 + boxOffset.left - offset.left,
					top: (backgroundImageHeight - boxHeight) / -2 + boxOffset.top - offset.top,
				});
			});
		}

		// 初期表示セット
		// スクリーン内でのオフセット割合計算
		var winScrollTop = $window.scrollTop();
		var offsetYRatio = (winScrollTop - boxOffsetTop + winHeight) / (winHeight + boxHeight);
		if (offsetYRatio &lt; 0) {
			offsetYRatio = 0;
		} else if (offsetYRatio &gt; 1) {
			offsetYRatio = 1;
		}
		parallaxBgScrollSetOffset(i, offsetYRatio);

		// クラス
		$elem.addClass('parallax-initialized');
		setTimeout(function(){
			$elem.addClass('parallax-ready');
		}, 16.6666);
	};

	// 初期化
	$elems.each(function(i){
		var $elem = $(this);
		var src = $elem.attr('data-parallax-image');
		var srcMobile = $elem.attr('data-parallax-mobile-image');

		if (!src &amp;&amp; srcMobile) {
			src = srcMobile;
			srcMobile = null;
		}

		var initialSrc = src;

		// パララックススクロール係数
		var speed = parseFloat($elem.attr('data-parallax-speed'));
		if (isNaN(speed)) {
			speed = parseFloat(defaultSpeed) || 0;
		}
		if (speed &lt; -1) {
			speed = -1;
		}
		if (speed &gt; 1) {
			speed = 1;
		}

		// 全体ぼかし
		var blur = parseFloat($elem.attr('data-parallax-blur'));
		if (isNaN(blur) || blur &lt; 0) {
			blur = parseFloat(defaultBlur) || 0;
		}
		if (blur &gt; 0) {
			var pos = $elem.css('position');
			if (pos !== 'absolute' &amp;&amp; pos !== 'fixed') {
				blur = 0;
			}
		}

		elemSettings[i] = {
			speed: speed,
			blur: blur
		};

		// 画像オブジェクト初期化
		images[i] = {};
		images[i].img = new Image();
		mobileImages[i] = {};
		mobileImages[i].img = new Image();

		// スマホの場合は1画像のみ
		if (isSmartPhone &amp;&amp; srcMobile) {
			src = srcMobile;
			initialSrc = srcMobile;
			srcMobile = null;
		}

		// オーバーレイぼかし
		var $closest, $overlayBlur;
		var elemPosition = $elem.css('position');
		if (elemPosition === 'relative') {
			$closest = $elem;
		} else if (elemPosition === 'absolute' || elemPosition === 'fixed') {
			$closest = $elem.offsetParent();
		}
		if ($closest) {
			$overlayBlur = $closest.find('[data-parallax-overlay-blur]').not('[data-parallax-overlay-blur=""], [data-parallax-overlay-blur="0"]');
		}

		// モバイルの場合でモバイル画像ありなら初期画像変更
		if (isParallaxMobile &amp;&amp; srcMobile) {
			initialSrc = srcMobile;
		}

		// オーバーレイぼかしありの場合、子要素生成
		if ($overlayBlur.length) {
			$overlayBlur.each(function(){
				var parallaxOverlayBlur= parseFloat(this.dataset.parallaxOverlayBlur);
				if (isNaN(parallaxOverlayBlur) || parallaxOverlayBlur &lt; 0) {
					return;
				}

				var $inner = $('<div class="parallax-overlay-blur-inner"></div>');

				// SVGでのぼかし
				if (useSvgBlur) {
					var $svg = parallaxCreateSvg(initialSrc, parallaxOverlayBlur);
					$inner.html($svg);
					if (!elemSettings[i].svgs) {
						elemSettings[i].svgs = [];
					}
					elemSettings[i].svgs.push = $svg;

				// filter:blurでのぼかし
				} else {
					$inner.css({
						backgroundImage: 'url(' + initialSrc + ')',
						backgroundPositionX: 'center',
						backgroundPositionY: 'center',
						backgroundRepeat: 'no-repeat',
						backgroundSize: 'cover',
						filter: 'blur(' + parallaxOverlayBlur + 'px)'
					});
				}

				$(this).css({
					overflow: 'hidden',
					position: 'absolute',
					bottom: 0,
					right: 0,
					left: 0,
					top: 0,
					zIndex: -1
				}).html($inner);
			});

			elemSettings[i].$overlayBlur = $overlayBlur;
			elemSettings[i].$overlayBlurInner = $closest.find('.parallax-overlay-blur-inner');
		}

		// 全体ぼかしあり
		if (elemSettings[i].blur) {
			// SVGでのぼかし
			if (useSvgBlur) {
				var $svg = parallaxCreateSvg(initialSrc, elemSettings[i].blur);
				$elem.html($svg);
				if (!elemSettings[i].svgs) {
					elemSettings[i].svgs = [];
				}
				elemSettings[i].svgs.push = $svg;

			// filter:blurでのぼかし
			} else {
				$elem.css({
					backgroundImage: 'url(' + initialSrc + ')',
					backgroundPositionX: 'center',
					backgroundPositionY: 'center',
					backgroundRepeat: 'no-repeat',
					backgroundSize: 'cover',
					filter: 'blur(' + elemSettings[i].blur + 'px)'
				});
			}

		// 全体ぼかしなし
		} else {
			$elem.css({
				backgroundImage: 'url(' + initialSrc + ')',
				backgroundPositionX: 'center',
				backgroundPositionY: 'center',
				backgroundRepeat: 'no-repeat',
				backgroundSize: 'cover'
			});
		}

		// モバイルの場合でモバイル画像あり
		if (isParallaxMobile &amp;&amp; srcMobile) {
			// 画像を読み込んでからサイズ計算
			var img = mobileImages[i].img;
			img.onload = function() {
				parallaxCalcBgImageSize(i);
			};
			img.src = srcMobile;
			if (img.complete) {
				parallaxCalcBgImageSize(i);
			}

			elemSettings[i].currentImageSrc = srcMobile;
			images[i].img.src = src;

		// PCの場合
		} else if (src) {
			// 画像を読み込んでからサイズ計算
			var img = images[i].img;
			img.onload = function() {
				parallaxCalcBgImageSize(i);
			};
			img.src = src;
			if (img.complete) {
				parallaxCalcBgImageSize(i);
			}

			elemSettings[i].currentImageSrc = src;

			if (srcMobile) {
				mobileImages[i].img.src = srcMobile;
			}
		}
	});

	parallaxBgScroll();

	// リサイズ
	$window.on('resize', function(){
		clearTimeout(resizeTimer);
		resizeTimer = setTimeout(function(){
			var w = window.innerWidth || $body.width();
			var h = window.innerHeight || $window.innerHeight();

			// モバイルでスクロール時のアドレスバー表示トグルでresizeイベントが実行されるため横幅のみで判定
			if (isMobile &amp;&amp; winWidth !== w || (!isMobile &amp;&amp; (winWidth !== w || winHeight !== h))) {
				winWidth = w;
				winHeight = h;
				isParallaxMobile = checkParallaxMobile();

				$elems.removeClass('parallax-initialized parallax-ready').each(function(i){
					parallaxCalcBgImageSize(i);
				});
				parallaxBgScroll();
			}
		}, isIE ? 100 : 16.6666);
	});

	// iOS系 ブラウザ戻る対策
	var isIOS = (ua.indexOf('iphone') &gt; -1 || ua.indexOf('ipad') &gt; -1 || ua.indexOf('ipod') &gt; -1 );
	if (isIOS) {
		window.addEventListener('pageshow', function(event) {
			if (event.persisted) {
				parallaxBgScroll();
			}
		});
	}

});
