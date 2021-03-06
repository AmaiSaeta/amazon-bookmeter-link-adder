// ==UserScript==
// @name        Amazon.co.jp - Bookmeter Link Adder
// @namespace   http://amaisaeta.seesaa.net/
// @author      AmaiSaeta (original script author: Jankokutou)
// @version     2.00.20190715
// @description Amazon.co.jpの商品ページに読書メーターへのリンクを追加する。
// @include     http*://www.amazon.co.jp/exec/obidos/ASIN/*
// @include     http*://www.amazon.co.jp/*/dp/*
// @include     http*://www.amazon.co.jp/dp/*
// @include     http*://www.amazon.co.jp/gp/product/*
// @include     http*://www.amazon.co.jp/o/ASIN/*
// @grant       GM_addStyle
// ==/UserScript==

(function () {

const link_id_name = "x_gmjct_ambmla";

function openWindow(event) {
	var link_uri;

	if (link_uri = event.currentTarget.href) {
		event.preventDefault();
		window.open(link_uri);
	}
}

function addBookmeterLink(target_node, asin) {
	var anchor_node, image_node;

	anchor_node = document.createElement("a");
	anchor_node.id = link_id_name;
	// This URL is old style. Redirect to new style URL. I affraid that the redirection will not work...
	anchor_node.href = "http://bookmeter.com/b/" + asin;
	image_node = document.createElement("img");
	image_node.src = "data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABAAAAAQAQMAAAAlPW0iAAAABlBMVEX///8yryUQtpbhAAAAAXRSTlMAQObYZgAAABZJREFUCJljYAACORTEfA+BqlERAwMArlEK2MwTLvAAAAAASUVORK5CYII=";
	image_node.setAttribute("width", "16");
	image_node.setAttribute("height", "16");
	image_node.setAttribute("alt", "読書メーター");
	anchor_node.appendChild(image_node);
	anchor_node.addEventListener("click", openWindow, false);

	target_node.appendChild(anchor_node);
}

function setMenuCSS() {
	var css_str = [
		"#" + link_id_name + " {margin: 0; padding: 0; border: 0; display: inline-block;}",
		"#" + link_id_name + " img {margin: 0; padding: 0; border: 0; vertical-align: bottom;}"
	].join("\n");
	var style_node;

	if (typeof GM_addStyle == typeof Function()) {
		GM_addStyle(css_str);
	}
	else {
		style_node = document.createElement("style");
		style_node.setAttribute("style", "text/css");
		style_node.appendChild(document.createTextNode(css_str));
		document.getElementsByTagName("head")[0].appendChild(style_node);
	}
}

function getAsin() {
	var f = function(name) {
		var list = document.getElementsByName(name);
		return (list.length == 0) ? null : list[0].getAttribute('value');
	};

	// 'ASIN' is contained the book page,
	// 'ASIN.0' is contained the Kindle page.
	var asin = f('ASIN') || f('ASIN.0');
	return asin;
}

// [TODO] 名前微妙
function generateXPathHasClass(className) {
	return 'contains(concat(" ", normalize-space(@class), " "), " ' + className + ' ")';
}

function getRootCategoryName(document) {
	// Deem from the leftmost link of the sub navigation.

	const xpath = '//*[@id="nav-subnav"]//*[' + generateXPathHasClass('nav-b') + ']';
	const rootCategoryElem = document.evaluate(
		xpath, document, null, XPathResult.FIRST_ORDERED_NODE_TYPE,
		null
	).singleNodeValue;
	const rootCategoryName = rootCategoryElem === null ? null : rootCategoryElem.textContent.trim();

	console.log("Found category", rootCategoryName);

	return rootCategoryName;
}

function isBookPage(document) {
	const category_name = getRootCategoryName(document);
	const book_category_names = ['本', 'Kindle本'];

	return book_category_names.some(name => name === category_name);
}

function getShareInterfaceContainer(document) {
	var f = document.getElementById.bind(document);
	// 'tell-a-friend-byline' is contained the book pages,
	// 'tafContainerDiv' is contained the Kindle pages.
	return f("tell-a-friend-byline") || f("tafContainerDiv");
}

if (!isBookPage(document)) {
	console.log("This page isn't for book.");
	return;
}

var link_container_node = getShareInterfaceContainer(document);
console.log('link_conteiner_node', !!link_container_node ? "found" : "not found");
var asin = getAsin();
console.log('asin: ' + asin);

if (asin && link_container_node) {
	setMenuCSS();
	addBookmeterLink(link_container_node, asin);
}

})();
