var weaviate_gql = weaviate_url + "/v1/graphql"
var wikidata_url = "https://query.wikidata.org/sparql?query="

// source: https://goessner.net/download/prj/jsonxml/xml2json.js
function xml2json(xml, tab) {
    var X = {
        toObj: function(xml) {
            var o = {};
            if (xml.nodeType==1) {   // element node ..
                if (xml.attributes.length)   // element with attributes  ..
                for (var i=0; i<xml.attributes.length; i++)
                    o["@"+xml.attributes[i].nodeName] = (xml.attributes[i].nodeValue||"").toString();
                if (xml.firstChild) { // element has child nodes ..
                var textChild=0, cdataChild=0, hasElementChild=false;
                for (var n=xml.firstChild; n; n=n.nextSibling) {
                    if (n.nodeType==1) hasElementChild = true;
                    else if (n.nodeType==3 && n.nodeValue.match(/[^ \f\n\r\t\v]/)) textChild++; // non-whitespace text
                    else if (n.nodeType==4) cdataChild++; // cdata section node
                }
                if (hasElementChild) {
                    if (textChild < 2 && cdataChild < 2) { // structured element with evtl. a single text or/and cdata node ..
                        X.removeWhite(xml);
                        for (var n=xml.firstChild; n; n=n.nextSibling) {
                            if (n.nodeType == 3)  // text node
                            o["#text"] = X.escape(n.nodeValue);
                            else if (n.nodeType == 4)  // cdata node
                            o["#cdata"] = X.escape(n.nodeValue);
                            else if (o[n.nodeName]) {  // multiple occurence of element ..
                            if (o[n.nodeName] instanceof Array)
                                o[n.nodeName][o[n.nodeName].length] = X.toObj(n);
                            else
                                o[n.nodeName] = [o[n.nodeName], X.toObj(n)];
                            }
                            else  // first occurence of element..
                            o[n.nodeName] = X.toObj(n);
                        }
                    }
                    else { // mixed content
                        if (!xml.attributes.length)
                            o = X.escape(X.innerXml(xml));
                        else
                            o["#text"] = X.escape(X.innerXml(xml));
                    }
                }
                else if (textChild) { // pure text
                    if (!xml.attributes.length)
                        o = X.escape(X.innerXml(xml));
                    else
                        o["#text"] = X.escape(X.innerXml(xml));
                }
                else if (cdataChild) { // cdata
                    if (cdataChild > 1)
                        o = X.escape(X.innerXml(xml));
                    else
                        for (var n=xml.firstChild; n; n=n.nextSibling)
                            o["#cdata"] = X.escape(n.nodeValue);
                }
                }
                if (!xml.attributes.length && !xml.firstChild) o = null;
            }
            else if (xml.nodeType==9) { // document.node
                o = X.toObj(xml.documentElement);
            }
            else
                alert("unhandled node type: " + xml.nodeType);
            return o;
        },
        toJson: function(o, name, ind) {
            var json = name ? ("\""+name+"\"") : "";
            if (o instanceof Array) {
                for (var i=0,n=o.length; i<n; i++)
                o[i] = X.toJson(o[i], "", ind+"\t");
                json += (name?":[":"[") + (o.length > 1 ? ("\n"+ind+"\t"+o.join(",\n"+ind+"\t")+"\n"+ind) : o.join("")) + "]";
            }
            else if (o == null)
                json += (name&&":") + "null";
            else if (typeof(o) == "object") {
                var arr = [];
                for (var m in o)
                arr[arr.length] = X.toJson(o[m], m, ind+"\t");
                json += (name?":{":"{") + (arr.length > 1 ? ("\n"+ind+"\t"+arr.join(",\n"+ind+"\t")+"\n"+ind) : arr.join("")) + "}";
            }
            else if (typeof(o) == "string")
                json += (name&&":") + "\"" + o.toString() + "\"";
            else
                json += (name&&":") + o.toString();
            return json;
        },
        innerXml: function(node) {
            var s = ""
            if ("innerHTML" in node)
                s = node.innerHTML;
            else {
                var asXml = function(n) {
                var s = "";
                if (n.nodeType == 1) {
                    s += "<" + n.nodeName;
                    for (var i=0; i<n.attributes.length;i++)
                        s += " " + n.attributes[i].nodeName + "=\"" + (n.attributes[i].nodeValue||"").toString() + "\"";
                    if (n.firstChild) {
                        s += ">";
                        for (var c=n.firstChild; c; c=c.nextSibling)
                            s += asXml(c);
                        s += "</"+n.nodeName+">";
                    }
                    else
                        s += "/>";
                }
                else if (n.nodeType == 3)
                    s += n.nodeValue;
                else if (n.nodeType == 4)
                    s += "<![CDATA[" + n.nodeValue + "]]>";
                return s;
                };
                for (var c=node.firstChild; c; c=c.nextSibling)
                s += asXml(c);
            }
            return s;
        },
        escape: function(txt) {
            return txt.replace(/[\\]/g, "\\\\")
                    .replace(/[\"]/g, '\\"')
                    .replace(/[\n]/g, '\\n')
                    .replace(/[\r]/g, '\\r');
        },
        removeWhite: function(e) {
            e.normalize();
            for (var n = e.firstChild; n; ) {
                if (n.nodeType == 3) {  // text node
                if (!n.nodeValue.match(/[^ \f\n\r\t\v]/)) { // pure whitespace text node
                    var nxt = n.nextSibling;
                    e.removeChild(n);
                    n = nxt;
                }
                else
                    n = n.nextSibling;
                }
                else if (n.nodeType == 1) {  // element node
                X.removeWhite(n);
                n = n.nextSibling;
                }
                else                      // any other node
                n = n.nextSibling;
            }
            return e;
        }
    };
    if (xml.nodeType == 9) // document node
        xml = xml.documentElement;
    var json = X.toJson(X.toObj(X.removeWhite(xml)), xml.nodeName, "\t");
    return "{\n" + tab + (tab ? json.replace(/\t/g, tab) : json.replace(/\t|\n/g, "")) + "\n}";
}

function sortObj(obj) {
    return Object.keys(obj).sort().reduce(function (result, key) {
        result[key] = obj[key];
        return result;
    }, {});
}

var showContent = function(results, similaritySearchQuery){
    var sorted = [];
    var delayCounter = 0;
    $(".nn-result").not("#first-result").remove();
    // sort the results
    $.each(results, function (i) {
        sorted.push(results[i]["certainty"]);
    })
    sorted = sorted.sort(function(a, b) { return b - a;});
    $.each(sorted, function(s){
        $.each(results, function (i) {
            if(results[i]["certainty"] === sorted[s]){
                var certainty = results[i]["certainty"] * 100;
                var box = $("#first-result").clone();
                box.removeAttr("id");
                box.find("h3").text(results[i]["label"]);
                box.find("small").html('<a href="' + i + '" target="_blank">' + getEntityId(i).substring(3) + '</a>');
                box.find(".bd-placeholder-img").css("background-image", "url('" + results[i]["image"] + "')");
                if(results[i]["image"] == ""){
                    box.find(".bd-placeholder-img").css("background-image", "url('https://upload.wikimedia.org/wikipedia/commons/6/65/No-Image-Placeholder.svg')");
                } else {
                    box.find(".bd-placeholder-img").css("background-image", "url('" + results[i]["image"] + "')");
                }
                box.find(".progress-bar").css("width", certainty + "%");
                box.find(".progress-bar").attr("aria-valuenow", certainty);
                box.find(".progress-bar").text("certainty: " + Math.round(certainty * 100) / 100 + "%");
                box.find(".btn-gql").attr("href", "http://console.semi.technology/console/query#weaviate_uri=" + weaviate_url + "&graphql_query=" + encodeURIComponent(similaritySearchQuery.query) + "&prettify=1");
                box.find(".btn-nn").click(function(e){
                    doSearch(getEntityId(i).substring(3));
                    e.preventDefault;
                });
                box.appendTo(".row");
                box.delay(delayCounter).fadeIn("slow");
                delayCounter += 50;
            }
        });
    })
}

var makeEntryGraphqlQuery = function(q) {
    return {
        "query": '{ Get { Entity( where: { path: ["url"] operator: Equal valueString: "http://www.wikidata.org/entity/' + q + '" } limit: 1 ) { url _additional { id } } } }',
        "variables":null
    }
}

var makeSimilarityGraphqlQuery = function(q) {
    return {
        "query": '{ Get { Entity( nearObject: { id: "' + q + '" certainty: 0.75 } limit: 24) { url _additional { id certainty } } Label( nearObject: { id: "' + q + '" certainty: 0.8 } ) { content language _additional { id certainty } } } }',
        "variables":null
    }
}

var makeEntrySparqlQuery = function(qs) {
    qs = qs.replaceAll(">_reverse_relatio", "");
    return encodeURIComponent('SELECT ?item ?itemLabel ?class ?classLabel ?projectLabel WHERE {\n VALUES ?item { ' + qs + ' }\n OPTIONAL { \n ?item wdt:P31 ?class;\n wdt:P18 ?project.\n } \n SERVICE wikibase:label { bd:serviceParam wikibase:language "en,en". } }')
}

var getGraphql = function(q, cb) {
    $.ajax({
        type: "POST",
        dataType: "json",
        contentType: "application/json;charset=utf-8",
        url: weaviate_gql,
        data: JSON.stringify(q),
        success: function(result){
            cb(result)
        }
    }); 
}

var getSparql = function(q, cb) {
    $.get( wikidata_url + q, function( result ) {
        cb(result);
    }).fail(function() {
        showNullResults();
    });
}

var getEntityId = function(e) {
    var array = e.split('/');
    return 'wd:' + array[array.length-1];
}

var getFromSparqlResult = function(needle, haystack){
    switch(needle) {
        case "image":
            for (let i = 0; i < haystack.binding.length; i++) {
                if(haystack.binding[i]["@name"] == "projectLabel"){
                    return haystack.binding[i]["literal"];
                }
            }
            return ""
        case "label":
            for (let i = 0; i < haystack.binding.length; i++) {
                if(haystack.binding[i]["@name"] == "itemLabel"){
                    return haystack.binding[i]["literal"]["#text"]
                }
            }
            return ""
        case "entity":
            for (let i = 0; i < haystack.binding.length; i++) {
                if(haystack.binding[i]["@name"] == "item"){
                    return haystack.binding[i]["uri"]
                }
            }
            return ""
        default:
            return ""
        }
}

var parseXML = function(xml){
    var returnObj = {}
    var xmlToJson = JSON.parse(xml2json(xml, ""));
    $(xmlToJson.sparql.results.result).each(function() {
        var entity = getFromSparqlResult('entity', this);
        var image = getFromSparqlResult('image', this);
        var label = getFromSparqlResult('label', this);
        returnObj[entity] = {
            'label': label,
            'image': image
        }
    });
    return returnObj
}

var addDistance = function(XMLresult, GraphQLresult){
    var entities = GraphQLresult.data.Get.Entity;
    for (let i = 0; i < entities.length; i++) {
        if(XMLresult[entities[i]["url"]] !== undefined ) {
            XMLresult[entities[i]["url"]]["certainty"] = entities[i]["_additional"]["certainty"];
        }
    }
    return XMLresult
}

var showResults = function(result){
    $(result.data.Get.Entity).each(function() {
        var similaritySearchQuery = makeSimilarityGraphqlQuery(this._additional.id);
        handleLoader('Do a similarity match in Weaviate');
        getGraphql(similaritySearchQuery, function(result){
            var entityArray = "";
            $(result.data.Get.Entity).each(function() {
                entityArray += (getEntityId(this.url)) + " ";
            })
            var sparqlQuery = makeEntrySparqlQuery(entityArray);
            handleLoader('Find meta-data and images from Wikidata');
            getSparql(sparqlQuery, function(XMLresult){
                var parsedResultsXml = parseXML(XMLresult);
                var parsedResults = addDistance(parsedResultsXml, result);
                showContent(parsedResults, similaritySearchQuery);
                $("#loader").hide();
            })
        })
    });
}

var showNullResults = function(){
    $("#loader").hide();
    $(".404").show();
}

var doSearch = function(q){
    var searchQuery = q;
    var getEntryQuery = makeEntryGraphqlQuery(searchQuery);
    $("#search-bar").val(q);
    $(".404").hide();
    $(".nn-result").hide();
    handleLoader('Find the vector position for this ID in Weaviate');
    getGraphql(getEntryQuery, function(result){
        if(result.data.Get.Entity.length === 0){
            showNullResults();
        } else {
            showResults(result);
        }
    });
}

function handleLoader(text){
    $("#loader").show();
    $("#loader").find(".loader-info").text(text);
}

$(document).ready(function() {
    $("#loader").hide();
    $("#exec-search").click(function(e){
        doSearch($("#search-bar").val());
        e.preventDefault();
    });
    $("#search-bar").keypress(function(e){
        if (e.which == 13) {
            e.preventDefault();
            doSearch($("#search-bar").val());
        }
    })
});
