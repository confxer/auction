package com.auction.mapper;

import java.sql.ResultSet;
import java.sql.SQLException;

import org.springframework.jdbc.core.RowMapper;
import org.springframework.lang.NonNull;

import com.auction.dto.AuctionDto;

public class AuctionRowMapper implements RowMapper<AuctionDto> {

    @Override
    public AuctionDto mapRow(@NonNull ResultSet rs, int rowNum) throws SQLException {
        AuctionDto dto = new AuctionDto();
        dto.setId(rs.getLong("id"));
        dto.setTitle(rs.getString("title"));
        dto.setStartPrice(rs.getInt("start_price"));
        return dto;
    }
}
