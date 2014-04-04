// Copyright (c) 2012 The Chromium Authors. All rights reserved.
// Use of this source code is governed by a BSD-style license that can be
// found in the LICENSE file.

var url = '', urlComponent = '', product = '', component = '';

chrome.runtime.onMessage.addListener(function(msg, _, sendResponse) {
    console.log(msg);

    if (msg.hasOwnProperty('currentUrl')) {
        url = msg.currentUrl;
        urlComponent = msg.component;
        product = url.indexOf('alchemysocial.com') > -1 ? 'ads_manager' : 'HAC';

        var path = (urlComponent.path).trim(), paths = path.split('/');

        if (product === 'ads_manager') {
            if (paths.length == 1) {
                component = 'index';
            }

            if (paths[1] === '') {
                component = 'index';
            } else {
                component = paths[1];

                if (component === 'report') {
                    component = 'Report Generator'
                }
            }
        }

        if (product === 'HAC') {
            if (paths[1] === 'reports') {
                component = 'reports';
            } else {
                component = '';
            }
        }

        if (component !== '') {
            var params = {'project' : product, 'component' : component};
            buildJira();
        }

    }
});

function buildJira() {
    if ($('#jira_hklhack').length === 0) {
        $('body').append('<div id="jira_hklhack"></div>');
        $('#jira_hklhack').css({
            'background-color' : '#fefefe',
            'border':'2px solid #ccc',
            'border-radius':'4px',
            'position':'absolute',
            'min-height':'350px',
            'top':'2px',
            'right': '10px',
            'width':'650px',
            'z-index': 10000
        }).addClass('jira_box');

        $('#jira_hklhack').append('<span id="jira_close" style="cursor: pointer; font-weight: bold; float:right;  padding: 10px;">x</span>' +
            '<span style="float:left; padding: 10px;">Team 007 - Jira plugin</span><br style="clear:both"/>');

        $('#jira_hklhack').append(
            '<div id="jira_content"></div>'
        );

        $('#jira_content').append(
            '<div id="jira_table" style="width: 590px; padding: 10px; margin:auto; min-height: 350px; overflow-y: auto;"></div>'
        );

        $('#jira_content').append(
            '<div id="jira_details" style="width: 590px; padding: 10px; margin:auto; min-height: 350px; overflow-y: auto;"></div>'
        );

        var detailsHtml = '<h3 id="jira_details_title" class="issue_details"></h3>'
            + '<span style="font-weight: bold; float: left; width: 150px">Reporter</span> '
            + '<span id="jira_details_reporter" class="issue_details" style="float: left; padding:5px;"></span><br style="clear: both;" />'
            + '<span style="font-weight: bold; float: left; width: 150px">Issue Type</span> '
            + '<span id="jira_details_issue_type" class="issue_details" style="float: left; padding:5px;"></span><br style="clear: both;" />'
            + '<span style="font-weight: bold; float: left; width: 150px">Created</span> '
            + '<span id="jira_details_created" class="issue_details" style="float: left; padding:5px;"></span><br style="clear: both;" />'
            + '<span style="font-weight: bold; float: left; width: 150px">Updated</span> '
            + '<span id="jira_details_updated" class="issue_details" style="float: left; padding:5px;"></span><br style="clear: both;" />'
            + '<span style="font-weight: bold; float: left; width: 150px">Priority</span> '
            + '<span id="jira_details_priority" class="issue_details" style="float: left; padding:5px;"></span><br style="clear: both;" />'
            + '<span style="font-weight: bold; float: left; width: 150px">Status</span> '
            + '<span id="jira_details_status" class="issue_details" style="float: left; padding:5px;"></span><br style="clear: both;" />'
            + '<span style="font-weight: bold; float: left; width: 150px">Description</span><br style="clear: both;" />'
            + '<div id="jira_details_desc" class="issue_details"></div><br />'
            + '<a id="jira_details_url" class="issue_details" href="" target="_blank">View in JIRA</a> | <a id="jira_details_close" href="#">Close</a>';

        $('#jira_details').hide();
        $('#jira_details').append(detailsHtml);

        $('#jira_close').click(function(){
            $('#jira_hklhack').hide();
        });

        $('#jira_details_close').click(function(){
            $('#jira_details').hide();
            $('#jira_table').show();
        });
    } else {
        if ($('#jira_hklhack').is(':visible')) {
            $('#jira_hklhack').hide();
        } else {
            $('#jira_hklhack').show();
        }
    }

    if ($('#jira_hklhack').is(':visible')) {
        addIssues();
    }

}

function addIssues() {
    var url = 'http://jira.alchemysocial.com/issues.php?project=' + product + '&component=' + component;
    console.log(url);
    $('#jira_table').empty();
    $('#jira_table').html('Loading.....');
    $.get(
        url,
        {},
        function(data){
            console.log(data);
            if (data.length > 0) {
                createIssuesList(data);
            } else {
                $('#jira_table').html('<span>No issue found on this module.</span>');
            }
        },
        'json'
    );
}

function createIssuesList(data) {
    $('#jira_table').empty();

    var html = '<table>';

    html += '<thead><tr style="background-color: #66afe9; border-top: 1px solid #ccc; border-left: 1px solid: #ccc;">'
        + '<th style="border-left: 1px solid #ccc; padding: 5px; text-align: left;" width="330px">Title</th>'
        + '<th style="border-left: 1px solid #ccc; padding: 5px; text-align: left;" width="120px">Reporter</th>'
        + '<th style="border-left: 1px solid #ccc; padding: 5px; text-align: left;" width="100px">Updated</th>'
        + '<th style="border-left: 1px solid #ccc; padding: 5px; text-align: left;" width="30px">Ty</th>'
        + '<th style="border-left: 1px solid #ccc; padding: 5px; text-align: left;" width="30px">Pr</th>'
        + '<th style="border-left: 1px solid #ccc; padding: 5px; text-align: left;" width="30px">St</th>'
        + '</tr></thead>';

    html += '<tbody>';
    var i = data.length;
    $.each(data, (function(index, issue){
        if (i === 1) {
            html += '<tr style="border-top: 1px solid #ccc; border-bottom: 1px solid #ccc;">';
        } else {
            html += '<tr style="border-top: 1px solid #ccc;">';
        }

        html +=  '<td id="index_' + index + '" class="index_clicked" style="border-left: 1px solid #ccc; padding: 5px;">' + issue.short_title + '</td>'
            + '<td style="border-left: 1px solid #ccc; padding: 5px;">' + issue.userid + '</td>'
            + '<td style="border-left: 1px solid #ccc; padding: 5px 0; text-align: center;">' + issue.updated + '</td>'
            + '<td style="border-left: 1px solid #ccc; padding: 5px 0; text-align: center;"><img title="'
                + issue.issue_type + '" src="' + issue.issue_type_icon + '" /></td>'
            + '<td style="border-left: 1px solid #ccc; padding: 5px 0; text-align: center;"><img title="'
                + issue.priority + '" src="' + issue.priority_icon + '" /></td>'
            + '<td style="border-left: 1px solid #ccc; border-right: 1px solid #ccc; padding: 5px 0; text-align: center;"><img title="'
                + issue.status + '" src="' + issue.status_icon + '" /></td>'
            +'</tr>';

        i--;
    }));

    html += '</tbody></table>';
    $('#jira_table').append(html);

    $('td.index_clicked').click(function(){
        console.log($(this).attr('id').replace('index_',''));
        var index = parseInt($(this).attr('id').replace('index_',''));
        loadDetails(data, index);
    });
}

function loadDetails(data, index) {
    $('#jira_details .issue_details').each(function(){
        var field = data[index], fieldName = $(this).attr('id').replace('jira_details_','');
        console.log(field);
        console.log(fieldName);

        if (field.hasOwnProperty(fieldName)) {
            if (fieldName === 'url') {
                $(this).attr('href', field[fieldName]);
            } else {
                $(this).html(field[fieldName]);
            }
        } else {
            $(this).html('-');
        }
    });

    $('#jira_details').show();
    $('#jira_table').hide();
}
