// ==UserScript==
// @name		Amazon.co.jp - Bookmeter Link Adder
// @namespace		http://amaisaeta.seesaa.net/
// @author		AmaiSaeta (original script author: Jankokutou)
// @version		1.00.20121204
// @description		Amazon.co.jpの商品ページに読書メーターへのリンクを追加する。
// @include		http://www.amazon.co.jp/exec/obidos/ASIN/*
// @include		http://www.amazon.co.jp/*/dp/*
// @include		http://www.amazon.co.jp/dp/*
// @include		http://www.amazon.co.jp/gp/product/*
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
	anchor_node.href = "http://book.akahoshitakuya.com/b/" + asin;
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
			"#" + link_id_name + " {margin: 0; padding: 0; border: 0;}",
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

function getTextContentOfElement(elem) {
	return (elem.textContent || elem.innerText);
}

function trimSpace(str) {
	return str.match(/^\s*(.*)\s*$/)[1];
}

function getAsin() {
	return document.getElementById('ASIN').getAttribute('value');
}

function getCategoryName() {
	var node = document.getElementsByClassName("nav-category-button")[0];
	return trimSpace(getTextContentOfElement(node));
}

function getCategoryNames() {
	var categoryNodesItr = document.evaluate(
		'.//a[contains(concat(" ", normalize-space(@class), " "), " nav_a ")]/text()',
		document.getElementById('nav_subcats_4'),
		null,
		XPathResult.ORDERED_NODE_ITERATOR_TYPE,
		null
	);
	var categoryNames = [];
	var node, name;

	while(node = categoryNodesItr.iterateNext()) {
		name = trimSpace(getTextContentOfElement(node));

		// Unlike the actual category name only 'Kindleストア'.
		if(name == 'Kindle本') name = 'Kindleストア';

		categoryNames.push(name);
	}
	return categoryNames;
}

var link_container_node = document.getElementById("tafContainerDiv");
var asin = getAsin();
var category_name = getCategoryName();
var category_names = getCategoryNames();

if (asin && (category_names.indexOf(category_name) != -1) && link_container_node) {
	setMenuCSS();
	addBookmeterLink(link_container_node, asin);
}
})();
