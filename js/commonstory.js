$(document).ready(function () {
    let gistUrl = "https://api.github.com/gists/";
    let storyChoise1 = $('#story_choise1');
    let storyChoise2 = $('#story_choise2');
    let storyBtnChoise1 = $('#story_btn_choise1');
    //let storyBtnChoise2 = $('#story_btn_choise2');
    let chatContent = $('#chat_content');
    let chatText = $('#chat_content pre');
    let chatContainer = $('.chat_container');
    let chatInput = $('.chat_container input');
    let chatCaption = $('.chat_container span');
    let chatGist = "8235c4cc0815b431257f01924d18f451";
    var lastPoll = 0;
    var chatBuffer = "...\n";
    let choises = [
        {
            obj: storyChoise1,
            btn: storyBtnChoise1,
            bg: "#ffaa51",
            gist: "f7a909a09b702400536dde45e4eaca7a",
            file: "choise1.json",
            title: "Spark Overview"
        }/*, 
        {
            obj: storyChoise2, 
            btn: storyBtnChoise2,
            bg: "#4CAF50",
            gist: "347490a01614343d1dc8b6ae3c2779b6",
            file: "choise2.json",
            title: "I don't have a beard"
        }*/
    ];
    // init
    showCounts();
    // def
    storyBtnChoise1.hover(
        () => selectChoise(storyChoise1),
        () => resetChoise()
    );
    /* storyBtnChoise2.hover(
         () => selectChoise(storyChoise2),
         () => resetChoise()
     );*/

    storyBtnChoise1.click(() => {
        onClick(storyChoise1);
    });
    /*
        storyBtnChoise2.click(() => {
            onClick(storyChoise2);
        });*/

    chatCaption.click(() => {
        let newHeight = chatContainer.height() == 20 ? 300 : 20;
        chatContainer.height(newHeight);
    });

    chatInput.keypress(function (e) {
        if (e.which === 13) {
            updateChatContent(chatInput.val());
            chatInput.val("");
        }
    });

    // set nickname
    var getUsername = () => getCookie("username");

    //set chat caption
    if (getUsername() === undefined) {
        // generateUsername
        $.get("https://frightanic.com/goodies_content/docker-names.php", data => {
            var caption = chatCaption.text();
            var newCaption = setChatCaption(data);
            document.cookie = `username = ${data}`;
            //fallback
            if (getUsername() === undefined) {
                getUsername = () => "unknown_bobo";
                chatCaption.text(`${caption} ( ${getUsername()})`);
            }
        });
    } else {
        setChatCaption(getUsername());
    }

    setInterval(() => {
        pullChatContent();
    }, 3000);


    function setChatCaption(username) {
        chatCaption.text(`${chatCaption.text()} ( ${username})`);
        return chatCaption.text();
    }

    function getCookie(name) {
        var parts = `; ${decodeURIComponent(document.cookie)}`.split("; " + name + "=");
        if (parts.length == 2) return parts.pop().split(";").shift();
    }

    function updateChatContent(newRecords = "") {
        if (newRecords.length > 0) {
            let chatRecord = `${getUsername()}: ${newRecords}`;
            sendReq(chatGist, "PATCH", `{"files":{"chat.txt":{"content":"${chatRecord}"}}}`);
            if (chatBuffer === "") {
                chatBuffer = chatText.text();
            }
            chatText.append(document.createTextNode(`${chatRecord}\n`));
        }
        chatContent.scrollTop(chatContent.prop("scrollHeight"));
    }

    function pullChatContent() {
        sendReq(`${chatGist}/commits?page=1&per_page=10`)
            .done(commits => {
                let [lastCommmit = { committed_at: "2011-06-20T11:34:15Z" }] = commits;
                let lastCommmitTime = Date.parse(lastCommmit.committed_at);
                if (lastCommmitTime > lastPoll) {
                    let promiseChatHistory =
                        commits.filter(commit => Date.parse(commit.committed_at) > lastPoll)
                            .reverse()
                            .map(commit => $.get(`https://gist.githubusercontent.com/commonstory/${chatGist}/raw/${commit.version}/chat.txt`));
                    $.when.apply(null, promiseChatHistory).then((...arguments) => {
                        if (chatBuffer !== "") {
                            chatText.text(chatBuffer);
                            chatBuffer = "";
                        }
                        let records = Array.isArray(arguments[0]) ? arguments : [[arguments[0]]];
                        records.forEach(record => chatText.append(document.createTextNode(`${record[0]}\n`)));
                        updateChatContent();
                    });
                    lastPoll = lastCommmitTime;
                }
            });
    }

    function onClick(selectedChoise) {
        storyBtnChoise1.off("mouseenter mouseleave click");
        //storyBtnChoise2.off( "mouseenter mouseleave click" );
        doForChoise(selectedChoise, sendChoise);
        selectChoise(selectedChoise);
    }

    function selectChoise(selectedChoise) {
        doForChoise(selectedChoise, showChoise, choise => choise.obj.hide());
    }

    function doForChoise(selectedChoise, action, orElse = () => { }) {
        choises.forEach(choise =>
            choise.obj === selectedChoise ? action(choise) : orElse(choise));
    }

    function showChoise(selectedChoise) {
        selectedChoise.obj.show();
        $("body").css("background-color", selectedChoise.bg);
    }

    function sendChoise(selectedChoise) {
        sendReq(selectedChoise.gist, "PATCH", `{"files":{"${selectedChoise.file}":{"content":"+"}}}`)
            .done(showCounts);
        $("#thanks").show();
    }

    function resetChoise() {
        $("body").css("background-color", "white");
        storyChoise1.hide();
        //storyChoise2.hide();
    }

    function showCounts() {
        choises.forEach(choise =>
            sendReq(choise.gist)
                .done(data => choise.btn.text(`${choise.title} (${data.history.length})`))
        );
    }

    function sendReq(url, method = 'GET', data) {
        return $.ajax({
            cache: false,
            dataType: "json",
            contentType: "application/json;charset=utf-8",
            type: method,
            beforeSend: function (xhr) {
                xhr.setRequestHeader('Authorization', `Bearer ${atob("OTI3NTJkZTg5ZTkzY2I0ZDZjYWJkZGVlNjM5N2UyZWQzZjAxNDU0Nw==")}`);
            },
            url: gistUrl + url,
            data: data
        });
    }
});