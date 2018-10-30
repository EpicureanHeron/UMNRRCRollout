function RRCprompts() {


    //////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////////////PROMPTS///////////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////

    var rawRRC = Browser.inputBox('Enter the RRC');
    var rawRRCContacts = Browser.inputBox('Enter the email addresses seperated with a comma and a space (", ") for each RRC contacts');

    var confirmText = "PLEASE REVIEW THE FOLLOWING INFORMATION CAREFULLY BEFORE HITTING OK. There is no going back.  "
    confirmText += " A folder and files personalized for " + rawRRC + " and a spreadsheet tab will be added."
    confirmText += " The following addresses will have all the access and be notified as well: " + rawRRCContacts
    var response = Browser.msgBox(confirmText, Browser.Buttons.OK_CANCEL);

    if (response === "ok") {
        Logger.log("OK!")
        RRCRollout(rawRRC, rawRRCContacts)
    } else {
        Logger.log("CANCELLED")
    }

}



function RRCRollout(RRC, RRCContacts) {



    // var RRC = Browser.inputBox('Enter the RRC');
    // var RRCContacts = Browser.inputBox('Enter the email addresses seperated with a comma for RRC contacts');

    //////////////////////////////////////////////////////////////////////////////////
    ///////////////////////CREATE FOLDER AND COPY IN FILES////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////

    //selects the rollout folder 
    var UTravelFolder = DriveApp.getFoldersByName("U Travel RRC Rollout").next()

    //creates a folder with that RRC's name
    var RRCFolder = UTravelFolder.createFolder(RRC + " Chrome River Rollout");

    //variable to hold template folder's path
    var templateFolder = UTravelFolder.getFoldersByName('00_Do_Not_Touch_Template_Folder').next()

    //Creates copies of all required files and sets them to their respective variables 
    var checklist = templateFolder.getFilesByName('ChecklistTemplate').next()

    var invite = templateFolder.getFilesByName('CRInvitationTemplate').next()

    var questionLog = templateFolder.getFilesByName('QuestionLog').next()
    
    var guide = templateFolder.getFilesByName('Getting Started Guide').next()

    var travelCard = templateFolder.getFilesByName('TravelCardApp.docx').next()

    var contactInfo = templateFolder.getFilesByName('U Travel Team Contact Info').next()

    var gettingStarted = templateFolder.getFilesByName('GettingStartedChromeRiverJA.pdf').next()

    var payingTravel = templateFolder.getFilesByName('PayingTravelExpensesJA.pdf').next()

    var sampleMessaging = templateFolder.getFilesByName('Sample Messaging').next()

    var cardOrderList = templateFolder.getFilesByName('Travel Card Order List').next()

    //creates a subfolder and puts it in the RRC folder 
    RRCFolder.createFolder(RRC + " Completed Travel Card Applications")

    var resoucesFolder = RRCFolder.createFolder("Resources")

    //copies the rest of the files and update their names 
    checklist.makeCopy(RRC + " Checklist", RRCFolder)

    var RRCquestionlog = questionLog.makeCopy(RRC + " Question Log", RRCFolder)

    travelCard.makeCopy(RRC + " Travel Card Application", RRCFolder)

    cardOrderList.makeCopy(RRC + ' Travel Card Order List', RRCFolder)
    
    guide.makeCopy('Getting Started Guide', RRCFolder)

    //Putting documents in Resources folder

    invite.makeCopy(RRC + " Chrome River Invite", resoucesFolder)

    contactInfo.makeCopy('U Travel Team Contact Info', resoucesFolder)

    gettingStarted.makeCopy('GettingStartedChromeRiverJA.pdf', resoucesFolder)

    payingTravel.makeCopy('PayingTravelExpensesJA.pdf', resoucesFolder)

    sampleMessaging.makeCopy('Sample Messaging', resoucesFolder)


    //Used in the linking of the spreadsheets
    var newCheckListID = RRCFolder.getFilesByName(RRC + " Checklist").next().getId()

    //Used for creating trigger 
    var quesitonLogID = RRCFolder.getFilesByName(RRC + " Question Log").next().getId()

    //////////////////////////////////////////////////////////////////////////////////
    ////////////////////////////SET PROJECTED GO LIVE DATE////////////////////////////
    ////////////////////////////////////////////////////////////////////////////////// 

    var ss = SpreadsheetApp.openById(newCheckListID)

    SpreadsheetApp.setActiveSpreadsheet(ss);

    var activePage = SpreadsheetApp.setActiveSheet(ss.getSheets()[0])

    var activeCell = activePage.getRange('A5')

    var goLiveDate = Utilities.formatDate(new Date(), "GMT-6", "yyyy, MM, dd")

    activeCell.setValue("=Date(" + goLiveDate + ") + 42")

    //grabs date from spreadsheet

    var goLiveDateCellValue = activeCell.getValue()

    //formats date

    var goLiveFormatted = Utilities.formatDate(goLiveDateCellValue, "GMT", "MM/dd/yyyy")



    //////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////////SET SECURITY///////////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////

    //Should be the U Travel Council Core member list who will have access to all folders
    
    var editorArr = ['jfthor@umn.edu', 'bethtapp@umn.edu', 'rgronfor@umn.edu', 'schle570@umn.edu', 'c-meye1@umn.edu']
    
    //var editorArr = ['jfthor@umn.edu']

    //creates an array of email addresses based on the breaking character of ", "
    var RRCContactsArr = RRCContacts.split(", ")

    //addes each element to the list of editors
    for (i = 0; i < RRCContactsArr.length; i++) {
        editorArr.push(RRCContactsArr[i])
    }

    //sets the security for the entire folder 
    RRCFolder.addEditors(editorArr)


    //////////////////////////////////////////////////////////////////////////////////
    ///////////////////////LINKS RRC CHECKLIST BACK TO MASTER SPREADSHEET/////////////
    //////////////////////////////////////////////////////////////////////////////////

    //used extensively this guide: https://alicekeeler.com/2016/04/10/google-apps-script-create-new-tabs/


    //opens the master spreadsheet, the ID is hardcoded in 
    var ss = SpreadsheetApp.openById("<masterspreadsheetID>")

    //sets the master spreadsheet to be active
    SpreadsheetApp.setActiveSpreadsheet(ss);

    //creates a sheet,and according to stack overflow, the new sheet should be the active sheet, so no need to grab it
    var create = ss.insertSheet(RRC)

    //sets the activeCell, which defaults to be A1 (I think)
    var activeCell = ss.getActiveRange()

    //Importrange has to take "" not single marks or it fails
    //the =Importrange allows the spreadsheets to be linked 
    var linkCheckLists = '=IMPORTRANGE("https://docs.google.com/spreadsheets/d/' + newCheckListID + '/edit?usp=sharing","sheet1!A1:D40")'

    //sets the value to the linkedCheckList importrange value
    activeCell.setValue(linkCheckLists)


    //////////////////////////////////////////////////////////////////////////////////
    ///////////////////////SUMMARY PAGE CREATION AND LINKING//////////////////////////
    //////////////////////////////////////////////////////////////////////////////////

    // summary page should always be at position 0 

    var summaryPage = SpreadsheetApp.setActiveSheet(ss.getSheets()[0])

    summaryPage.insertRowsAfter(1, 1)

    var summaryPage = SpreadsheetApp.setActiveSheet(ss.getSheets()[0])

    //sets RRC, Col A
    var activeCell = summaryPage.getRange('A2')

    activeCell.setValue(RRC)

    //sets Contact Date, Col B
    var activeCell = summaryPage.getRange('B2')

    var contactDate = Utilities.formatDate(new Date(), "GMT-6", "MM/dd/yyyy")

    activeCell.setValue(contactDate)

    //sets Go Live Date, Col C
    var activeCell = summaryPage.getRange('C2')

    var goLiveDate = "=" + RRC + "!A5"

    activeCell.setValue(goLiveDate)

    //sets Follow Up Date, Col D

    var followUpDate = Utilities.formatDate(new Date(), "GMT-6", "yyyy, MM, dd")

    var activeCell = summaryPage.getRange('D2')

    activeCell.setValue("=Date(" + followUpDate + ") + 137")

    //sets PA Decision, Col E

    var preApproval = "=" + RRC + "!A6"

    var activeCell = summaryPage.getRange('E2')

    activeCell.setValue(preApproval)

    //sets Navigator Info, Col F

    var navigators = "=" + RRC + "!A9"

    var activeCell = summaryPage.getRange('F2')

    activeCell.setValue(navigators)

    //sets Rollout Style, Col G

    var rolloutStyle = "=" + RRC + "!A10"

    var activeCell = summaryPage.getRange('G2')

    activeCell.setValue(rolloutStyle)


    //sets analytics, Col H

    var analytics = "=" + RRC + "!A11"

    var activeCell = summaryPage.getRange('H2')

    activeCell.setValue(analytics)


    //sets 1st Batch of TCards, Col I

    var tcardBatch = "=" + RRC + "!A17"

    var activeCell = summaryPage.getRange('I2')

    activeCell.setValue(tcardBatch)


    //All Tcards, Col J

    var allTCard = "=" + RRC + "!A18"

    var activeCell = summaryPage.getRange('J2')

    activeCell.setValue(allTCard)




    //////////////////////////////////////////////////////////////////////////////////
    ///////////////////////////////CREATE AND SEND EMAIL /////////////////////////////
    //////////////////////////////////////////////////////////////////////////////////

    //within the RollOut folder, there exists two google docs, invitePart1 and invitePart2.
    //these have the invite document broken into two HTML parts

    //Establishes the id for the first part of the invite email
    var invitehtml1ID = templateFolder.getFilesByName('invitePart1').next().getId()

    //opens that document 
    var invitehtml1Opened = DocumentApp.openById(invitehtml1ID)

    //copies the text to a variable
    var text1 = invitehtml1Opened.getText()

    //steps through the process again for the 2nd half of the invite
    var invitehtml2ID = templateFolder.getFilesByName('invitePart2').next().getId()

    var invitehtml2Opened = DocumentApp.openById(invitehtml2ID)

    var text2 = invitehtml2Opened.getText()

    //gets the new RRC's URL
    var RRCurl = RRCFolder.getUrl()

    //builds out the message in HTML

    //the header image is hosted on the purchasing webpage
    var completeHTML = "<img src='http://purchasing.umn.edu/assets/img/InviteImage.png' alt='utravel'>"

    //First line of the email where the RRC is specified 
    completeHTML += "<p>I’m writing to invite your unit, " + RRC + ", to begin using Chrome River for travel and expense reimbursements and determine who needs to apply for the new Travel Card program. </p>"

    //first half of the invite is added 
    completeHTML += text1

    //provides a unique URL to the RRC's folder 
    completeHTML += "<p>You can access your Google Drive Folder <a href='" + RRCurl + "'> here</a>.</p>"

    //second half of the invite is added
    completeHTML += text2
    completeHTML += "<h2 style='color: #7A0019'> Anticipated Go-Live Date </h2>"
    completeHTML += "<p>We are excited to have you begin using Chrome River.  In general, units are usually ready to begin using Chrome River within approximately six weeks, which means your estimated go-live date will be:</p>"
    completeHTML += "<h3 style='text-align: center; color: #7A0019'>"  + goLiveFormatted + "</h3>"
    completeHTML += "<p>We look forward to meeting with you to discuss your rollout of Chrome River. Please let us know if you have any questions.</p><p>Beth Tapp</p><p>Interim Director</p><p>Purchasing Services</p>"
    
    

    //If the editorArr has more than 1 value, the array is joined with ", " again
    if (editorArr.length > 1) {
        var emailsFormatter = editorArr.join(", ")
    } else {
        var emailsFormatter = editorArr[0]
    }

    //mails out the email 
    MailApp.sendEmail({
        to: emailsFormatter,
        subject: "Chrome River Invitation",
        htmlBody: completeHTML

    })
    var finishRolloutHtml = "<p>Rollout for " + RRC + " is almost complete! Please navigate <a href='" + RRCquestionlog.getUrl() + "'>HERE</a> with the Travel@umn.edu account and enable the Triggers menu item (it may take a second to load)."
    finishRolloutHtml += " Then select 'Click to run trigger set up'. It should ask for authorization for several Google services to run for the Travel@umn.edu account. Thanks!</p>"
    MailApp.sendEmail({
        to: 'travel@umn.edu',
        subject: 'One more step to finish rollout for ' + RRC,
        htmlBody: finishRolloutHtml

    })

};