import moment from "moment";

function formatMessage(username: any, text: string) {
    return {
        username: username,
        text: text,
        time: moment().format('H:mm a')
    }
}

export default formatMessage;
