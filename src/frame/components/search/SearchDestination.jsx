import { Box, IconButton, Input, SvgIcon, Typography } from '@mui/material';
import { Close } from '@mui/icons-material';
import React, { useContext, useEffect, useState } from 'react';
import AppContext from '../../../context/AppContext';
import { apiGet } from '../../../util/HttpApi';
import styles from '../../../map/components/map.module.css';
//import { ReactComponent as SearchIcon } from '../../../assets/icons/ic_action_search_dark.svg';
import { ReactComponent as Target } from '../../../assets/icons/ic_action_route_direction_here.svg';

export default function SearchDestination() {
    const ctx = useContext(AppContext);

    const [processSearch, setProcessSearch] = useState(false);

    const searchEnable = () => {
        const shallowClone = { ...ctx.searchDestinationCtx };
        shallowClone.query = '';

        ctx.setSearchDestinationCtx(shallowClone);
    };
    const searchRun = (event) => {
        if (event.key === 'Enter') {
            let hash = window.location.hash;
            if (!hash) {
                alert('Please zoom in closer');
                return;
            }
            let arr = hash.split('/');
            if (parseInt(arr[0].substring(1)) < 7) {
                alert('Please zoom in closer');
                return;
            }
            let latlng = { lat: parseFloat(arr[1]), lng: parseFloat(arr[2]) };
            setProcessSearch(true);
            searchAsync(ctx.searchDestinationCtx.query, latlng).then();
        }
    };

    /*const searchRunChangeText = (event) => {
        let hash = window.location.hash;
        if (!hash) {
            alert('Please zoom in closer');
            return;
        }
        let arr = hash.split('/');
        if (parseInt(arr[0].substring(1)) < 7) {
            alert('Please zoom in closer');
            return;
        }
        let latlng = { lat: parseFloat(arr[1]), lng: parseFloat(arr[2]) };
        setProcessSearch(true);
        searchAsync(event.target.value, latlng).then();
    };*/

    const cancelSearch = () => {
        const shallowClone = { ...ctx.searchDestinationCtx };
        delete shallowClone.query;
        delete shallowClone.geojson;
        ctx.setSearchDestinationCtx(shallowClone);
    };
    const updateSearch = (event) => {
        const shallowClone = { ...ctx.searchDestinationCtx };
        shallowClone.query = event.target.value;
        ctx.setSearchDestinationCtx(shallowClone);
        //searchRunChangeText(event);
    };

    const searchAsync = async (text, latlng) => {
        const params = `lat=${latlng.lat.toFixed(6)}&lon=${latlng.lng.toFixed(6)}&search=${text}`;
        const response = await apiGet(`${process.env.REACT_APP_ROUTING_API_SITE}/routing/search/search?${params}`, {
            method: 'GET',
            headers: { 'Content-Type': 'application/json' },
        });
        if (response.ok) {
            let data = await response.json();
            let props = {};
            console.log(data);
            if (data.features.length > 0) {
                props = data.features[0]?.properties;
            }
            const copy = { ...ctx.searchDestinationCtx };
            copy.id = new Date().getTime();
            copy.props = props;
            copy.geojson = data;
            ctx.setSearchDestinationCtx(copy);
            ctx.setSearchCtx(copy);
            setProcessSearch(false);
        }
    };

    useEffect(() => {
        let resultText = '';
        if (processSearch) {
            resultText = `Searching…`;
        } else {
            if (ctx.searchDestinationCtx.geojson) {
                resultText = `Found ${ctx.searchDestinationCtx.geojson.features.length} search results.`;
            }
        }
        ctx.setHeaderText((prevState) => ({
            ...prevState,
            search: { text: resultText },
        }));
    }, [ctx.searchDestinationCtx, ctx.searchDestinationCtx, processSearch, setProcessSearch]);

    return (
        <Box>
            <Box
                sx={{
                    mt: ctx.searchDestinationCtx.query === undefined && '8px',
                    px: '8px',
                    ml: ctx.searchDestinationCtx.query !== undefined && '15px',
                }}
            >
                {ctx.searchDestinationCtx.query !== undefined && (
                    <>
                        <Input
                            // inputProps={{ style: { color: 'white' } }}
                            label="Search Results"
                            inputRef={(input) => {
                                if (input != null) {
                                    input.focus();
                                }
                            }}
                            placeholder="Informe seu local de destino"
                            onChange={updateSearch}
                            onKeyPress={searchRun}
                        ></Input>
                        <IconButton onClick={cancelSearch} className={styles.customIconPath}>
                            <Close />
                        </IconButton>
                    </>
                )}
                {ctx.searchDestinationCtx.query === undefined && (
                    <Box
                        onClick={searchEnable}
                        sx={{ display: 'flex', flexDirection: 'row', backgroundColor: 'transparent' }}
                    >
                        <SvgIcon className={styles.customIconPath} component={Target} inheritViewBox />
                        <Typography variant="inherit" className={styles.searchTitle}>
                            Seu destino
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
