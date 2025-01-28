export interface ScreenData {
    id : number;
    name : string;
    link : string;
    time : string;
    folder_id : string;
    userId : string;
    customId ?: string;
    screens ?: any
    startTime ?: string;
    endTime ?: string;
    screenname : string;
}

export interface PlaylistData {
    id : number;
    name : string;
    created_at : string;
    playlistName : string;
    time : string;
    userId : string;
    folder_name : string;
}