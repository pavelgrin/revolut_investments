// -----------------------------------------------------------------------------
// Handle query building
const QueryParams = Object.freeze({
    DateFrom: "from",
    DateTo: "to",
    Symbol: "symbol",
    Currency: "currency",
})

const dateFromInput = document.getElementById("dateFromInput")
const dateToInput = document.getElementById("dateToInput")
const dateUpdateButton = document.getElementById("dateUpdateButton")

const currencySelect = document.getElementById("currencySelect")

const symbolLinks = document.querySelectorAll("[symbol]")

dateFromInput.value = __DATE_FROM__
dateToInput.value = __DATE_TO__
currencySelect.value = __CURRENCY__

const commonUrl = new URL(location.href)
const symbolUrl = new URL(location.href)

symbolLinks.forEach((link) => {
    symbolUrl.searchParams.set(
        QueryParams.Symbol,
        link.getAttribute(QueryParams.Symbol)
    )
    link.href = symbolUrl.href
})

currencySelect.addEventListener("change", () => {
    commonUrl.searchParams.set(QueryParams.Currency, currencySelect.value)

    location.href = commonUrl.href
})

dateUpdateButton.addEventListener("click", () => {
    commonUrl.searchParams.set(QueryParams.DateFrom, dateFromInput.value)
    commonUrl.searchParams.set(QueryParams.DateTo, dateToInput.value)

    location.href = commonUrl.href
})
// -----------------------------------------------------------------------------

// -----------------------------------------------------------------------------
// Handle statement uploading
const fileInput = document.getElementById("fileInput")
const fileUploadButton = document.getElementById("fileUploadButton")

const responseCaptionWaiting = document.getElementById(
    "responseCaptionWaiting"
)
const responseCaptionOk = document.getElementById("responseCaptionOk")
const responseCaptionError = document.getElementById(
    "responseCaptionError"
)

if (localStorage.getItem("uploaded")) {
    responseCaptionWaiting.style.opacity = 0
    responseCaptionError.style.opacity = 0
    responseCaptionOk.style.opacity = 1

    localStorage.removeItem("uploaded")
}

fileUploadButton.addEventListener("click", async () => {
    responseCaptionWaiting.style.opacity = 0
    responseCaptionOk.style.opacity = 0
    responseCaptionError.style.opacity = 0

    if (!fileInput.files.length) {
        responseCaptionError.style.opacity = 1
        return
    }

    responseCaptionWaiting.style.opacity = 1

    const formData = new FormData()
    formData.append("statement", fileInput.files[0])
    fileInput.value = ""

    try {
        const res = await fetch("/update", { method: "POST", body: formData }) 

        if (res.ok) {
            localStorage.setItem("uploaded", true)
            location.href = commonUrl.href
        } else {
            throw new Error("Updating error")
        }
    } catch(e) {
        responseCaptionWaiting.style.opacity = 0
        responseCaptionError.style.opacity = 1
    }
})
// -----------------------------------------------------------------------------
