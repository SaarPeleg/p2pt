Feature('PlantPage - maarav');


Scenario('Test iteration 1', ({ I }) => {
    I.amOnPage('http://127.0.0.1:5500/client/index.html');
    I.wait(3)
    I.click('כללי');
    I.wait(1);
    I.scrollPageToBottom();
    pause();
});

Scenario('test iteration2', ({ I }) => {
    I.amOnPage('http://127.0.0.1:5500/client/index.html');
    I.click('#PlantPageButton');
    I.wait(1);
    I.click("ג'ונגל מזרח");
    I.wait(1);
    I.fillField("input[name=datetext]","");
    I.wait(1);
    I.click("מצא תאריך אופטימלי");
    I.wait(1);
    I.seeInPopup("invalid date")
    I.acceptPopup();
    I.wait(1);
    I.fillField("input[name=datetext]","08/20/2021")
    I.click("מצא תאריך אופטימלי");
    pause();
});
