$(document).ready(function(){
    let gistUrl = "https://api.github.com/gists/";
    let storyChoise1 = $('#story_choise1');
    let storyChoise2 = $('#story_choise2');
    let storyBtnChoise1 = $('#story_btn_choise1');
    let storyBtnChoise2 = $('#story_btn_choise2');
    let choises = [
        {
            obj: storyChoise1,
            btn: storyBtnChoise1,
            bg: "#ffaa51",
            gist: "f7a909a09b702400536dde45e4eaca7a",
            file: "choise1.json",
            title: "I have a beard"
        }, 
        {
            obj: storyChoise2, 
            btn: storyBtnChoise2,
            bg: "#4CAF50",
            gist: "347490a01614343d1dc8b6ae3c2779b6",
            file: "choise2.json",
            title: "I don't have a beard"
        }
    ];
// init
    showCounts();
// def
    storyBtnChoise1.hover(
        () => selectChoise(storyChoise1),
        () => resetChoise()
    );
    storyBtnChoise2.hover(
        () => selectChoise(storyChoise2),
        () => resetChoise()
    );

    storyBtnChoise1.click(() => {
        onClick(storyChoise1);
    });

    storyBtnChoise2.click(() => {
        onClick(storyChoise2);
    });

    function onClick(selectedChoise){
        storyBtnChoise1.off( "mouseenter mouseleave click" );
        storyBtnChoise2.off( "mouseenter mouseleave click" );
        doForChoise(selectedChoise, sendChoise);
        selectChoise(selectedChoise);
    }

    function selectChoise(selectedChoise){
        doForChoise(selectedChoise, showChoise, choise => choise.obj.hide());
    }

    function doForChoise(selectedChoise, action, orElse = () => {}){
        choises.forEach( choise => 
            choise.obj === selectedChoise ? action(choise) : orElse(choise) );
    }

    function showChoise(selectedChoise){
        selectedChoise.obj.show();
        $("body").css("background-color", selectedChoise.bg);
    }

    function sendChoise(selectedChoise){
        sendReq(selectedChoise.gist, "PATCH", `{"files":{"${ selectedChoise.file }":{"content":"+"}}}`)
            .done(showCounts );
        $("#thanks").show();
    }

    function resetChoise(){
        $("body").css("background-color", "white"); 
        storyChoise1.hide();
        storyChoise2.hide();
    }

    function showCounts(){
        choises.forEach( choise => 
            sendReq(choise.gist)
                .done(data => choise.btn.text(`${ choise.title } (${ data.history.length })`)) 
            );
    }

    function sendReq(url, method = 'GET', data){
        return $.ajax({
            cache: false,
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            type: method,
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', 'Bearer f9f53dcf78d2d3b2c7cf70abb3432c513301cf34');
            },
            url: gistUrl + url,
            data: data
          });
    }
});
//f9f53dcf78d2d3b2c7cf70abb3432c513301cf34
//https://gist.github.com/commonstory/11ffc484e15a89d090adc9da568e063d