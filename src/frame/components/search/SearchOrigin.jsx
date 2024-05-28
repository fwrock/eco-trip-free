import { Box, IconButton, Input, SvgIcon, Typography } from '@mui/material';
import { Close } from '@mui/icons-material';
import React, { useContext, useEffect, useState } from 'react';
import AppContext from '../../../context/AppContext';
import { apiGet } from '../../../util/HttpApi';
import styles from '../../../map/components/map.module.css';
import { ReactComponent as MyLocation } from '../../../assets/icons/ic_action_my_location.svg';

export default function SearchOrigin() {
    const ctx = useContext(AppContext);

    const [processSearch, setProcessSearch] = useState(false);

    const searchEnable = () => {
        const shallowClone = { ...ctx.searchOriginCtx };
        shallowClone.query = '';

        ctx.setSearchOriginCtx(shallowClone);
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
            searchAsync(ctx.searchOriginCtx.query, latlng).then();
        }
    };
    const cancelSearch = () => {
        const shallowClone = { ...ctx.searchOriginCtx };
        delete shallowClone.query;
        delete shallowClone.geojson;
        ctx.setSearchOriginCtx(shallowClone);
    };
    const updateSearch = (event) => {
        const shallowClone = { ...ctx.searchOriginCtx };
        shallowClone.query = event.target.value;
        ctx.setSearchOriginCtx(shallowClone);
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
            if (data.features.length > 0) {
                props = data.features[0]?.properties;
            }
            const copy = { ...ctx.searchOriginCtx };
            copy.id = new Date().getTime();
            copy.props = props;
            copy.geojson = data;
            ctx.setSearchOriginCtx(copy);
            setProcessSearch(false);
        }
    };

    useEffect(() => {
        let resultText = '';
        if (processSearch) {
            resultText = `Searching…`;
        } else {
            if (ctx.searchOriginCtx.geojson) {
                resultText = `Found ${ctx.searchOriginCtx.geojson.features.length} search results.`;
            }
        }
        ctx.setHeaderText((prevState) => ({
            ...prevState,
            search: { text: resultText },
        }));
    }, [ctx.searchOriginCtx, ctx.setSearchOriginCtx, processSearch, setProcessSearch]);

    return (
        <Box>
            <Box
                sx={{
                    mt: ctx.searchOriginCtx.query === undefined && '8px',
                    px: '8px',
                    ml: ctx.searchOriginCtx.query !== undefined && '15px',
                }}
            >
                {ctx.searchOriginCtx.query !== undefined && (
                    <>
                        <Input
                            // inputProps={{ style: { color: 'white' } }}
                            label="Search Results"
                            inputRef={(input) => {
                                if (input != null) {
                                    input.focus();
                                }
                            }}
                            placeholder="Informe seu local de partida"
                            onChange={updateSearch}
                            onKeyPress={searchRun}
                        ></Input>
                        <IconButton onClick={cancelSearch} className={styles.customIconPath}>
                            <Close />
                        </IconButton>
                    </>
                )}
                {ctx.searchOriginCtx.query === undefined && (
                    <Box
                        onClick={searchEnable}
                        sx={{ display: 'flex', flexDirection: 'row', backgroundColor: 'transparent' }}
                    >
                        <SvgIcon className={styles.customIconPath} component={MyLocation} inheritViewBox />
                        <Typography variant="inherit" className={styles.searchTitle}>
                            Ponto de partida
                        </Typography>
                    </Box>
                )}
            </Box>
        </Box>
    );
}
