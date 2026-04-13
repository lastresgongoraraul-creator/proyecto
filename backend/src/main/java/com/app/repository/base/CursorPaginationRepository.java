package com.app.repository.base;

import org.springframework.data.domain.Pageable;
import org.springframework.data.repository.NoRepositoryBean;
import org.springframework.data.repository.Repository;

import java.io.Serializable;
import java.util.List;

@NoRepositoryBean
public interface CursorPaginationRepository<T, ID extends Serializable> extends Repository<T, ID> {
    
    /**
     * Finds next page after the given cursor ID.
     * Logic: SELECT * FROM table WHERE id > :lastId ORDER BY id ASC LIMIT :pageSize
     */
    List<T> findTopNByIdGreaterThanOrderByIdAsc(ID lastId, Pageable pageable);
}
