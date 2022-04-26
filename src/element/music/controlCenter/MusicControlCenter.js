import Box from "@mui/material/Box";
import {useEffect, useState} from "react";
import {toDislikeSong, toGetSong, toGetSongDetails, toLikeSong} from "../../../routers/musicApi";
import { connect } from 'react-redux';
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import {
    CloseFullscreen,
    Comment,
    Favorite,
    FavoriteBorder,
    Lyrics, OpenInFull,
    Pause,
    PlayArrow,
    Repeat, RepeatOne,
    SkipNext,
    SkipPrevious
} from "@mui/icons-material";
import {Card, IconButton, Slider, styled} from "@mui/material";
import store from "../../../reducer/store";
import {handleLikeSongInStore} from "../../../reducer/likeListReducer";
import {deleteArray, formatDuration} from "../../../util/mathUtil";
import {LyricBox} from "./LyricBox";
import {theme} from "../../../asset/theme";
import {CommentBox} from "./CommentBox";
import {changeArtistState} from "../../../reducer/artistReducer";
import {useNavigate} from "react-router";
import {changeSong} from "../../../reducer/musicReducer";
import {changeRepeatPlay} from "../../../reducer/repeatPlayReducer";


function MusicControlCenter(props){
    const navigate =useNavigate()

    const [url,setUrl] = useState("")
    const [song,setSong] = useState({})

    const [isLyric,setIsLyric] = useState(true)
    const [isFull,setIsFull] = useState(false)

    const [playlist,setPlaylist] = useState(props.playlistReducer.playlist.map(item=>item.id))

    //是否加载
    const [isAudioLoad,setIsAudioLoad] =useState(false)

    //音乐操作
    const [isLike,setIsLike] = useState(false)

    const [isPlaying, setIsPlaying] = useState(false);

    const [isRepeatOne, setIsRepeatOne] = useState(props.repeatPlayReducer.repeatPlay);

    const [position, setPosition] = useState(0);

    const [duration, setDuration] = useState(200);

    const audio = document.getElementById("musicAudio")


    //播放列表初始化
    useEffect(()=>{
        setPlaylist(props.playlistReducer.playlist.map(item=>item.id))
    },[props.playlistReducer.playlist])


    //拿到 store => 歌曲信息
    useEffect(()=>{
        // console.log(props.musicReducer.song)
        if (props.musicReducer.song.hasOwnProperty("id")){

            toGetSongDetails(props.musicReducer.song.id,data =>{
                setSong(data.songs[0])
            })

            toGetSong(props.musicReducer.song.id,data =>{
                setUrl(data.data[0].url)
                setIsAudioLoad(true)
            })
        }

    },[props.musicReducer.song])




    //设置audio 初始化
    useEffect(()=>{

        if (isAudioLoad){

            audio.src = url
            audio.addEventListener("canplay", function(){
                setDuration(audio.duration)
                setIsPlaying(true)
            });
            audio.addEventListener("timeupdate",function(){//监听音频播放的实时时间事件
                    setPosition(audio.currentTime)
            },false);
            audio.addEventListener("ended",function(){//监听音频播放的实时时间事件

                if (!isRepeatOne){
                    changeNextSong()
                }

            },false);
        }
    },[isAudioLoad, url])


    useEffect(()=>{
        if (isAudioLoad){
            if (isRepeatOne){
                audio.loop = true
            }else if (!isRepeatOne){
                audio.loop = false

            }
        }
    },[isRepeatOne,isAudioLoad])

    //设置喜欢
    useEffect(()=>{
        if (props.likeListReducer.likeList.includes(song.id)){
            setIsLike(true)
        }else {
            setIsLike(false)
        }
    },[props.likeListReducer.likeList, song.id])





    const changeNextSong = () =>{
        setSong({})
        setIsPlaying(false)
        toGetSongDetails(playlist[playlist.indexOf(props.musicReducer.song.id) + 1] || playlist[0],data =>{
            store.dispatch(changeSong(data.songs[0]))
        })
    }

    const changeLastSong = () =>{
        setSong({})
        setIsPlaying(false)
        toGetSongDetails(playlist[playlist.indexOf(props.musicReducer.song.id) - 1] || playlist[0],data =>{
            store.dispatch(changeSong(data.songs[0]))
        })
    }



    const handleLikeSong = (e) => {

      toLikeSong(song.id,res => {
          const  likeSongs= props.likeListReducer.likeList.concat(song.id)
          console.log(likeSongs.length)
          store.dispatch(handleLikeSongInStore(likeSongs))
          setIsLike(true)
      })

    }

    const handleDislikeSong = (e) => {

        toDislikeSong(song.id,res => {
            const  likeSongs = deleteArray(props.likeListReducer.likeList,song.id)
            console.log(likeSongs.length)
            store.dispatch(handleLikeSongInStore(likeSongs))
            setIsLike(false)
    })
    }



    const handleLyric = (time) => {
        audio.currentTime =time
    }


        return (
            <Box id={"musicControlCenter"} className={props.musicBarVisible?"musicBarVisible":props.isHidePlayController?"disPlayNone":isFull?"musicControlCenterFull":""}>
                <audio id={"musicAudio"} autoPlay src={url}/>

                {isAudioLoad?
            <Card
                className={  isFull?"musicControlBarFull card":   "card"}
                style={{cursor:"default",position:"relative"}}
            >
                {
                    <img className={"shadowImg"} style={isFull?{width: "80%", height: "auto",minWidth:"220px",margin:"10%",border:"none",borderRadius:"15px",overflow:"hidden"}:{width: "220px", height: "220px",minWidth:"220px",background:"transparent",border:"none",margin:"20px",borderRadius:"15px",overflow:"hidden"}}
                         src={(song.hasOwnProperty("al"))? song.al.picUrl :""}
                         alt={""}/>
                }

                <Box sx={isFull?{margin:"10px 0 10px 10%"}:{margin:"10px 0 15px 20px"}}>
                    <Typography variant="h5" component="h2">
                        {song.hasOwnProperty("name") ?
                            song.name
                            :
                            "No Song"
                        }
                    </Typography>

                        {song.hasOwnProperty("ar") ?
                            song.ar.map((item,key) => {
                            return(
                                <Button key={key} variant={"text"} onClick={()=>{
                                    store.dispatch(changeArtistState(item));
                                    navigate("/music/artist")
                                }}>
                                    {item.name}
                                </Button>
                                )

                            }):
                            "No Artist"
                        }

                </Box>



                <Box sx={isFull?{marginTop:"120px",paddingX:"20px",}:{paddingX:"20px",marginBottom:"70px"}}>
                    <Slider
                        aria-label="time-indicator"
                        size="small"
                        value={position}
                        min={0}
                        step={1}
                        max={duration}
                        onChange={(e, value) => {
                            audio.currentTime = e.target.value;
                        }}
                        sx={{
                            color: theme.palette.mode === 'dark' ? '#fff' : 'rgba(0,0,0,0.87)',
                            height: 4,
                            '& .MuiSlider-thumb': {
                                width: 8,
                                height: 8,
                                transition: '0.3s cubic-bezier(.47,1.64,.41,.8)',
                                '&:before': {
                                    boxShadow: '0 2px 12px 0 rgba(0,0,0,0.4)',
                                },
                                '&:hover, &.Mui-focusVisible': {
                                    boxShadow: `0px 0px 0px 8px ${
                                        theme.palette.mode === 'dark'
                                            ? 'rgb(255 255 255 / 16%)'
                                            : 'rgb(0 0 0 / 16%)'
                                    }`,
                                },
                                '&.Mui-active': {
                                    width: 20,
                                    height: 20,
                                },
                            },
                            '& .MuiSlider-rail': {
                                opacity: 0.28,
                            },
                        }}
                    />
                    <Box
                        sx={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            mt: -2,
                        }}
                    >
                        <TinyText>{formatDuration(position)}</TinyText>
                        <TinyText>{formatDuration(duration)}</TinyText>
                    </Box>




                    <Box sx={{width:"100%",textAlign: 'center'}}>
                        <IconButton size={"small"} sx={{marginX:"2px"}} onClick={()=>{
                            setIsRepeatOne(!isRepeatOne)
                            store.dispatch(changeRepeatPlay(!isRepeatOne))
                        }}>
                            {(isRepeatOne)?<RepeatOne sx={{height:15,width:15}}/>:<Repeat sx={{height:15,width:15}}/>}
                        </IconButton>
                        <IconButton aria-label="previous"  onClick={changeLastSong}>
                            {theme.direction === 'rtl' ? <SkipNext /> : <SkipPrevious />}
                        </IconButton>
                        <IconButton aria-label="play/pause" onClick={()=>{ setIsPlaying(!isPlaying) ;if (isPlaying){audio.pause()}else { audio.play() }}}>
                            {isPlaying?<Pause  sx={{ height: 38, width: 38 }}/>:<PlayArrow sx={{ height: 38, width: 38 }} />}
                        </IconButton>
                        <IconButton id={"nextButton"} aria-label="next" onClick={changeNextSong}>
                            {theme.direction === 'rtl' ? <SkipPrevious /> : <SkipNext />}
                        </IconButton>
                        <IconButton size={"small"} className={props.musicBarVisible?"disPlayNone":""} sx={{marginX:"2px"}} onClick={()=>{
                        setIsFull(!isFull)
                        }
                        }>
                            {isFull?<CloseFullscreen sx={{height:15,width:15}}/>:<OpenInFull sx={{height:15,width:15}} />}
                        </IconButton>
                    </Box>

                </Box>





                    <Box>

                    <Box sx={{position:"absolute",bottom:"20px",right:"20px"}}>

                        <Button startIcon={(isLyric)?<Comment />:<Lyrics/>} onClick={()=>{
                            setIsLyric(!isLyric)
                        }}>
                            {(isLyric)?"评论":"歌词"}
                        </Button>
                        {(props.userReducer.user !== null)?
                        <Button startIcon={isLike ? <Favorite />:<FavoriteBorder />} onClick={isLike?handleDislikeSong: handleLikeSong}>
                            {isLike ? "已喜欢":"喜欢"}
                        </Button>:""}
                    </Box>
                    </Box>



            </Card>
                    :""
                }
                {
                    (props.musicReducer.song !== undefined && props.musicReducer.song.id !== undefined) ?

                    (isLyric) ?
                        <LyricBox isFull={isFull} id={props.musicReducer.song.id} position={position} handleLyric={handleLyric}/>
                        :
                        <CommentBox isFull={isFull} id={props.musicReducer.song.id}/>

                :""
                }

            </Box>

        )
}


const TinyText = styled(Typography)({
    fontSize: '0.75rem',
    opacity: 0.38,
    fontWeight: 500,
    letterSpacing: 0.2,
});

//从reducer中获取初始值，props.xxx就可以直接拿
const mapStateToProps = (state) => ({userReducer: state.userReducer,
    likeListReducer: state.likeListReducer,
    musicReducer: state.musicReducer,
    playlistReducer: state.playlistReducer,
    repeatPlayReducer: state.repeatPlayReducer,
    userCookieReducer: state.userCookieReducer});


export default connect(mapStateToProps,null)(MusicControlCenter);