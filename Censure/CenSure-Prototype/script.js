function ekUpload() {
    function Init() {
        console.log("Upload Initialised");
        var fileSelect = document.getElementById('file-upload'),
            fileDrag = document.getElementById('file-drag'),
            submitButton = document.getElementById('submit-button');
        fileSelect.addEventListener('change', fileSelectHandler, false);
        // Is XHR2 available?
        var xhr = new XMLHttpRequest();
        if (xhr.upload) {
            // File Drop
            fileDrag.addEventListener('dragover', fileDragHover, false);
            fileDrag.addEventListener('dragleave', fileDragHover, false);
            fileDrag.addEventListener('drop', fileSelectHandler, false);
        }
    }

    function fileDragHover(e) {
        var fileDrag = document.getElementById('file-drag');
        e.stopPropagation();
        e.preventDefault();
        fileDrag.className = (e.type === 'dragover' ? 'hover' : 'modal-body file-upload');
    }

    function fileSelectHandler(e) {
        // Fetch FileList object
        var files = e.target.files || e.dataTransfer.files;
        // Cancel event and hover styling
        fileDragHover(e);
        // Process all File objects
        for (var i = 0, f; f = files[i]; i++) {
            parseFile(f);
            uploadFile(f);
        }
    }
    // Output
    function output(msg) {
        // Response
        var m = document.getElementById('messages');
        m.innerHTML = msg;
    }

    function parseFile(file) {
        // console.log(file.name);
        output('<strong>' + encodeURI(file.name) + '</strong>');
        var imageName = file.name;
        var isGood = (/\.(?=jpg|png|jpeg)/gi).test(imageName);
        if (isGood) {
            document.getElementById('start').classList.add("hidden");
            document.getElementById('response').classList.remove("hidden");
            document.getElementById('notimage').classList.add("hidden");
            // Thumbnail Preview
            img.src = URL.createObjectURL(file);
            document.getElementById('file-image').classList.remove("hidden");
            document.getElementById('file-image').src = URL.createObjectURL(file);
        } else {
            document.getElementById('file-image').classList.add("hidden");
            document.getElementById('notimage').classList.remove("hidden");
            document.getElementById('start').classList.remove("hidden");
            document.getElementById('response').classList.add("hidden");
            document.getElementById("file-upload-form").reset();
        }
    }

    function setProgressMaxValue(e) {
        var pBar = document.getElementById('file-progress');
        if (e.lengthComputable) {
            pBar.max = e.total;
        }
    }

    function updateFileProgress(e) {
        var pBar = document.getElementById('file-progress');

        if (e.lengthComputable) {
            pBar.value = e.loaded;
        }
    }

    function shuffleArray(array) {
        for (var i = array.length - 1; i > 0; i--) {
            var j = Math.floor(Math.random() * (i + 1));
            var temp = array[i];
            array[i] = array[j];
            array[j] = temp;
        }
    }

    function handleResponse(e) {
        // if (xhr.readyState == 4) {
        //     console.log(JSON.parse(xhr.responseText))
        //     pBar.className = (xhr.status == 200 ? "success" : "failure");
        // }
        let result = e.result[0].prediction
            // let hover = document.getElementsByClassName("editimage")[0]
            // hover.style.display = 'block'
            // hover.removeAttribute("hidden")
            // setTimeout(() => hover.classList.add("openup"), 300)

        for (let i = 0; i < nX; i++) {
            for (let j = 0; j < nY; j++) {
                checkerbox.push([i * sizeBox, j * sizeBox])
            }
        }

        shuffleArray(checkerbox)
        canvas.style.pointerEvents = 'auto'

        checkerbox.map((box, index) => {
            setTimeout(() => {
                ctx.fillStyle = 'black'
                ctx.fillRect(box[0], box[1], sizeBox + 1, sizeBox + 1)
                if (index == checkerbox.length - 1) {
                    startImageEdit()
                }
            }, 50 * index - decRate)
            decRate += 40
        })
    }

    function startImageEdit() {
        let iW = img.width,
            iH = img.height,
            scale = cH / iH
        ctx.mozImageSmoothingEnabled = false;
        ctx.webkitImageSmoothingEnabled = false;
        ctx.msImageSmoothingEnabled = false;
        ctx.imageSmoothingEnabled = false;
        // ((cW - iW * scale) / 2)
        var scale1 = Math.min((canvas.width / img.width), (canvas.height / img.height));
        var sw1 = img.width * scale1;
        var sh1 = img.height * scale1;
        var startPoint = (canvas.width - sw1) / 2
        ctx.drawImage(img, (canvas.width - sw1) / 2, (canvas.height - sh1) / 2, sw1, sh1);
        // ctx.drawImage(img, 0, 0, iW, iH, 0, 0, iW * scale, cH)
        localStorage.getItem("results")
        let dem = object.result[0].prediction
        dem.forEach(demo => {
            var data = ctx.getImageData(startPoint + demo.xmin * scale, demo.ymin * scale, 1, 1).data;
            var rgb = [data[0], data[1], data[2]];
            ctx.fillStyle = "rgb(" + rgb.join(",") + ")"
            ctx.fillRect(startPoint + demo.xmin * scale - 3, demo.ymin * scale - 3, (demo.xmax - demo.xmin) * scale + 5, (demo.ymax - demo.ymin) * scale + 5)
        })
        var link = document.createElement('a');
        link.download = 'filename.png';
        link.href = canvas.toDataURL()
        link.click();
    }

    function uploadFile(file) {
        var xhr = new XMLHttpRequest(),
            pBar = document.getElementById('file-progress'),
            fileSizeLimit = 10; // In MB
        if (xhr.upload) {
            if (file.size <= fileSizeLimit * 1024 * 1024) {
                pBar.style.display = 'inline';
                xhr.upload.addEventListener('loadstart', setProgressMaxValue, false);
                xhr.upload.addEventListener('progress', updateFileProgress, false);
                var data = new FormData();
                data.append('file', file)
                xhr.open("POST", "https://app.nanonets.com/api/v2/OCR/Model/195b5ec8-24fc-411d-8de1-d97736db950c/LabelFile/");
                xhr.onreadystatechange = handleResponse
                // xhr.setRequestHeader("authorization", "Basic " + btoa(":"));
                xhr.send(data)
                handleResponse(object)
            } else {
                output('Please upload a smaller file (< ' + fileSizeLimit + ' MB).');
            }
        }
    }

    // Check for the various File API support.
    if (window.File && window.FileList && window.FileReader) {
        Init();
    } else {
        document.getElementById('file-drag').style.display = 'none';
    }
}

let canvas = document.querySelector("canvas")
let ctx = canvas.getContext('2d')
let cW = window.innerWidth,
    cH = window.innerHeight,
    checkerbox = [],
    sizeBox = 100,
    nX = Math.ceil(cW / sizeBox),
    nY = Math.ceil(cH / sizeBox),
    decRate = 0,
    img

canvas.width = cW
canvas.height = cH
canvas.style.pointerEvents = 'none'
img = document.createElement("img")
ekUpload();
let object = {
    "message": "Success",
    "result": [{
        "message": "Success",
        "input": "Screenshot_20210527-154608_WhatsApp.jpg",
        "prediction": [{
                "label": "Username",
                "xmin": 254,
                "ymin": 42,
                "xmax": 473,
                "ymax": 87,
                "score": 0.52954185,
                "ocr_text": "MITACS"
            },
            {
                "label": "Username",
                "xmin": 508,
                "ymin": 308,
                "xmax": 835,
                "ymax": 349,
                "score": 0.8341743,
                "ocr_text": "~Shubham Goyal"
            },
            {
                "label": "Username",
                "xmin": 1038,
                "ymin": 514,
                "xmax": 1193,
                "ymax": 550,
                "score": 0.97553873,
                "ocr_text": "~Isshita"
            },
            {
                "label": "Username",
                "xmin": 724,
                "ymin": 954,
                "xmax": 905,
                "ymax": 991,
                "score": 0.9725346,
                "ocr_text": "~Anshika"
            },
            {
                "label": "Username",
                "xmin": 719,
                "ymin": 1163,
                "xmax": 874,
                "ymax": 1198,
                "score": 0.97373235,
                "ocr_text": "~Isshita"
            },
            {
                "label": "Username",
                "xmin": 1012,
                "ymin": 1484,
                "xmax": 1193,
                "ymax": 1517,
                "score": 0.9671866,
                "ocr_text": "~Anshika"
            },
            {
                "label": "Username",
                "xmin": 507,
                "ymin": 1852,
                "xmax": 661,
                "ymax": 1887,
                "score": 0.98115826,
                "ocr_text": "~Isshita"
            },
            {
                "label": "Username",
                "xmin": 944,
                "ymin": 2208,
                "xmax": 1195,
                "ymax": 2254,
                "score": 0.9849564,
                "ocr_text": "~Shruti Priya"
            },
            {
                "label": "Phone_Number",
                "xmin": 90,
                "ymin": 310,
                "xmax": 473,
                "ymax": 347,
                "score": 0.8405373,
                "ocr_text": "+91 94666 03427"
            },
            {
                "label": "Phone_Number",
                "xmin": 91,
                "ymin": 519,
                "xmax": 473,
                "ymax": 555,
                "score": 0.98149127,
                "ocr_text": "+91 87088 86113"
            },
            {
                "label": "Phone_Number",
                "xmin": 116,
                "ymin": 614,
                "xmax": 318,
                "ymax": 649,
                "score": 0.8627734,
                "ocr_text": "+91 6900"
            },
            {
                "label": "Phone_Number",
                "xmin": 90,
                "ymin": 958,
                "xmax": 473,
                "ymax": 995,
                "score": 0.96201164,
                "ocr_text": "+91 95703 28630"
            },
            {
                "label": "Phone_Number",
                "xmin": 90,
                "ymin": 1166,
                "xmax": 473,
                "ymax": 1204,
                "score": 0.97758967,
                "ocr_text": "+91 87088 86113"
            },
            {
                "label": "Phone_Number",
                "xmin": 90,
                "ymin": 1486,
                "xmax": 473,
                "ymax": 1524,
                "score": 0.93673515,
                "ocr_text": "+91 95703 28630"
            },
            {
                "label": "Phone_Number",
                "xmin": 90,
                "ymin": 1855,
                "xmax": 472,
                "ymax": 1893,
                "score": 0.8322258,
                "ocr_text": "+91 87088 86113"
            },
            {
                "label": "Phone_Number",
                "xmin": 90,
                "ymin": 2214,
                "xmax": 162,
                "ymax": 2249,
                "score": 0.954597,
                "ocr_text": "+91"
            },
            {
                "label": "Phone_Number",
                "xmin": 337,
                "ymin": 2214,
                "xmax": 474,
                "ymax": 2250,
                "score": 0.61008495,
                "ocr_text": "73502"
            }
        ],
        "page": 0,
        "request_file_id": "c620d753-5d10-4570-9b8b-c493604acbd2",
        "filepath": "uploadedfiles/195b5ec8-24fc-411d-8de1-d97736db950c/PredictionImages/43797208.jpeg",
        "id": "4a0b3905-c226-11eb-acea-422f34be951a",
        "rotation": 0
    }],
    "signed_urls": {
        "uploadedfiles/195b5ec8-24fc-411d-8de1-d97736db950c/PredictionImages/43797208.jpeg": {
            "original": "https://nnts.imgix.net/uploadedfiles/195b5ec8-24fc-411d-8de1-d97736db950c/PredictionImages/43797208.jpeg?expires=1622489934&or=0&s=7bcf8210cced67da3ae355d83f5f034a",
            "original_compressed": "https://nnts.imgix.net/uploadedfiles/195b5ec8-24fc-411d-8de1-d97736db950c/PredictionImages/43797208.jpeg?auto=compress&expires=1622489934&or=0&s=65c9cf1a95c68cb749cab89378551739",
            "thumbnail": "https://nnts.imgix.net/uploadedfiles/195b5ec8-24fc-411d-8de1-d97736db950c/PredictionImages/43797208.jpeg?auto=compress&expires=1622489934&w=240&s=2e75ed75a3638da62f062572dfbfa2f0",
            "acw_rotate_90": "https://nnts.imgix.net/uploadedfiles/195b5ec8-24fc-411d-8de1-d97736db950c/PredictionImages/43797208.jpeg?auto=compress&expires=1622489934&or=270&s=bf06a53bb6a5f069cacbf901c046260a",
            "acw_rotate_180": "https://nnts.imgix.net/uploadedfiles/195b5ec8-24fc-411d-8de1-d97736db950c/PredictionImages/43797208.jpeg?auto=compress&expires=1622489934&or=180&s=669b54eb8475d842c03dfbad4e04de8e",
            "acw_rotate_270": "https://nnts.imgix.net/uploadedfiles/195b5ec8-24fc-411d-8de1-d97736db950c/PredictionImages/43797208.jpeg?auto=compress&expires=1622489934&or=90&s=d0a1b6d9e432e6ae557d7b650cd18045",
            "original_with_long_expiry": "https://nnts.imgix.net/uploadedfiles/195b5ec8-24fc-411d-8de1-d97736db950c/PredictionImages/43797208.jpeg?expires=1638027534&or=0&s=b9f66cacb0106c24294258f965ab9319"
        }
    }
}