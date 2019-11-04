/* global window,document,$ */
"use strict";
const uuid = require("uuid/v4");
const QueryStatement = require("../lib/dynamodb-query-statement.js");
require("./jquery-uitext.js");
//const ScanStatement = require("../lib/dynamodb-query-statement.js");
//const PutItemStatement = require("../lib/dynamodb-put-item-statement.js");
//const DeleteItemStatement = require("../lib/dynamodb-delete-item-statement.js");
const appId = uuid();
const id = name => `${name}-${appId}`;

function DynamoDbApiParameter(appFrame) {
    appFrame.addClass("ui-widget");
    this.txtProjectionExpression = $(`<input type="text" class="text" id="${id("txtProjectionExpression")}"/>`).val("name");
    this.txtTableName = $(`<input type="text" class="text" id="${id("txtTableName")}"/>`).val(`stars`);
    this.txtKeyConditionExpression = $(`<input type="text" class="text" id="${id("txtKeyConditionExpression")}"/>`).val(`mainStar="SUN"`);
    this.txtFilterExpression = $(`<input type="text" class="text" id="${id("txtFilterExpression")}"/>`).val(`radius < 100`);
    this.txtLimit = $(`<input type="text" class="number" id="${id("txtLimit")}"/>`).css("text-align", "right").val(5);
    this.preResultParameter = $(`<pre id="${id("apiParameter")}"/>`)
        .css("webkitUserSelect ", "auto").css("userSelect ", "auto")
        .css("width", "100%");
    this.btnCopyParam = $(`<button type="button">Copy</button>`).button();

    const inputLabel = (input, caption) =>
        $(`<label for="${input.attr("id")}">${caption}</label>`)
        .css("display", "inline-block").css("width", "200px");
    //const remarkId = id =>
    //    `remark-of-${id}`;
    //const spanRemark = (input, remark) =>
    //    $(`<span id="${remarkId(input.attr("id"))}">${remark}</label>`)
    //    .css("display", "inline-block")
    //    .css("margin-left", "1em");
    const input = (mandatory, input, caption, remark) => {
        const checkboxId = id => `enable-${id}`;
        const enableInput = (input, state) => {
            if(state) {
                input.prop("disabled", false);
                input.val(input.attr("latest"));
                input.focus();
            } else {
                input.attr("latest", input.val());
                input.val("");
                input.prop("disabled", true);
            }
        };
        const applyCheckbox = (cb, input) => {
            if(cb.prop("checked")) {
                enableInput(input, true);
            } else {
                enableInput(input, false);
            }
        };
        const container = $(`<div/>`)
            .css("margin-bottom", "1em")
            .css("vertical-align", "base-line")
            .attr("title", remark);
        if(mandatory) {
            container.append(
                $(`<span>*</span>`)
                    .css("color", "red")
                    .css("margin", "3px 3px 3px 4px")
                    .css("text-align", "center")
                    .css("display", "inline-block")
                    .css("width", "30px"));
        } else {
            container.append(
                $(`<input type="checkbox" class="optional" id="${checkboxId(input.attr("id"))}"/>`)
                    .css("width", "30px")
                    .bind("click", ()=>{
                        applyCheckbox($(`#${checkboxId(input.attr("id"))}`), input);
                    })
            );
            applyCheckbox($(`#${checkboxId(input.attr("id"))}`), input);
        }
        container
            .append(inputLabel(input, caption))
            .append(input);
        if(input.hasClass("text")) {
            input.uitext();
        }
        return container;
    };

    appFrame
        .append($(`<h2>DynamoDB Query API Parameter Generator</h2>`))
        .append($(`<h3>Query Specification</h3>`))
        .append(input(true, this.txtTableName, "TableName", "Table name (mandatory)"))
        .append(input(true, this.txtKeyConditionExpression, "KeyConditionExpression", "Key condition (mandatory)"))
        .append(input(false, this.txtFilterExpression, "FilterExpression", "Filter (applied after scanning)"))
        .append(input(false, this.txtLimit, "Limit", "Number of result rows. zero means no limit."))
        .append(input(false, this.txtProjectionExpression, "ProjectionExpression", "List of attribute name"))
        .append($(`<h3>Query API Parameter</h3>`))
        .append(this.preResultParameter).append($(`<br/>`))
        .append(this.btnCopyParam);
    appFrame.find("input[type=text]").bind("input", () => this.convert());
    appFrame.find("input[type=checkbox]").bind("input", () => this.convert());
    this.btnCopyParam.bind("click", ()=>{
        document.getSelection().selectAllChildren(this.preResultParameter.get(0));
        const copy = document.execCommand("copy");
        console.log(`${copy}`);
    })
    this.txtLimit.spinner({
        min: 0,
        spin: (event, ui) => {
            this.txtLimit.spinner("value", ui.value);
            this.convert();
        },
        change: () => this.convert(),
    });
    this.preResultParameter.uitext();
    this.convert();
}
DynamoDbApiParameter.prototype.convert = function() {
    const projectionExpression = this.txtProjectionExpression.val().trim();
    const tableName = this.txtTableName.val().trim();
    const keyConditionExpression = this.txtKeyConditionExpression.val().trim();
    const FilterExpression = this.txtFilterExpression.val().trim();
    const Limit = this.txtLimit.spinner("value");
    try {
        if(!tableName) {
            throw new Error(`TableName required`);
        }
        if(!keyConditionExpression) {
            throw new Error(`KeyConditionExpression required`);
        }
        const sqlish = [];
        if(projectionExpression) {
            sqlish.push(`SELECT ${projectionExpression}`);
        }
        sqlish.push(`FROM ${tableName}`);
        sqlish.push(`WHERE ${keyConditionExpression}`);
        if(FilterExpression) {
            sqlish.push(`Filter ${FilterExpression}`);
        }
        if(Limit) {
            console.log(`Limit:${Limit}:${typeof(Limit)}`);
            sqlish.push(`LIMIT ${Limit}`);
        }
        const apiParameter = this.convertQueryParam(sqlish.join(" "));
        console.log(JSON.stringify(apiParameter, null, 2));
        $(`#${id("apiParameter")}`).empty().html(JSON.stringify(apiParameter, null, 2));
        $(`#${id("txtParameter")}`).empty().html(JSON.stringify(apiParameter, null, 2));
        $(`#${id("message")}`).html("OK");
    } catch(err) {
        $(`#${id("message")}`).html(err.message);
    }
};

DynamoDbApiParameter.prototype.convertQueryParam = function(source) {
    const statement = new QueryStatement(source);
    return statement.getParameter();
};

DynamoDbApiParameter.initialize = (appFrame)=> {
    console.log(`DynamoDbParamConv.initialize`);
    return new DynamoDbApiParameter(appFrame);
};

window.DynamoDbApiParameter = DynamoDbApiParameter;