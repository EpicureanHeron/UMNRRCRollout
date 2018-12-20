function onOpen() {

    var ui = SpreadsheetApp.getUi();
    ui.createMenu('Triggers')
        .addItem('Click to run trigger setup', 'triggerSetUp')
        .addToUi();

}


function triggerSetUp() {

    ScriptApp.newTrigger('emailAndClearChangeLog')
        .timeBased()
        .everyHours(12)
        .create();

    ScriptApp.newTrigger("updateChangeLog")
        .forSpreadsheet(SpreadsheetApp.getActive())
        .onEdit()
        .create();

}


function updateChangeLog(e) {
    var ss = SpreadsheetApp.getActive()

    if (e.source.getSheetName() === "QuestionLog" && e.range.getColumn() === 4.0) {

        var range = e.range;
        var updated = range.getValue()

        if (updated) {

            var emailaddress = e.user

            var ChangeLog = ss.getSheetByName('ChangeLog')

            ChangeLog.insertRowsAfter(1, 1)

            var activeCell = ChangeLog.getRange('A2')

            activeCell.setValue(emailaddress)

            var activeCell = ChangeLog.getRange('B2')

            activeCell.setValue(updated)
        }

    }

}

function emailAndClearChangeLog() {

    var ss = SpreadsheetApp.getActive().getSheetByName('ChangeLog')

    var finalRowWithData = ss.getLastRow()

    if (finalRowWithData >= 2) {

        Logger.log("creating email")

        var dateUpdate = Utilities.formatDate(new Date(), "GMT-6", "MM/dd/yyyy")

        var ssName = SpreadsheetApp.getActive().getName()

        var ssURL = SpreadsheetApp.getActive().getUrl()

        var html = "<h2>Questions have been added to " + ssName + ".</h2><h2> Here is a direct link to the spreadsheet: <a href='" + ssURL + "'>" + ssName + "</a></h2>"
        
        html += "<p>The below is a log of all edits in the Question Column. Some duplication may occur if a question was entered and then later edited.</p>"
        
        html += "<p>This log is for convenience and to offer a brief summary of activity on this spreadsheet. Please use the spreadsheet itself as the final record</p>"
        

        for (i = 2; i <= finalRowWithData; i++) {

            var colA = ss.getRange(i, 1)

            var colB = ss.getRange(i, 2)

            html += "<p>" + colA.getValue() + " asked the following question: " + colB.getValue() + "</p>"

            colA.setValue('')
            colB.setValue('')

        }

        MailApp.sendEmail({
            to: 'travel@umn.edu',
           // to: 'jfthor@umn.edu',
            subject: "RRC Rollout: Questions added to " + ssName + " on " + dateUpdate,
            htmlBody: html
        })

    } else {
        Logger.log("Nothing to send")
    }
}