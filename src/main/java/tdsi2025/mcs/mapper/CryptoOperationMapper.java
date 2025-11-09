package tdsi2025.mcs.mapper;

import org.mapstruct.Mapper;
import tdsi2025.mcs.dto.CryptoOperationDTO;
import tdsi2025.mcs.model.CryptoOperation;

@Mapper(componentModel = "spring", uses = {AppUserMapper.class})
public interface CryptoOperationMapper {

    CryptoOperationDTO toDto(CryptoOperation entity);

    CryptoOperation toEntity(CryptoOperationDTO dto);
}

